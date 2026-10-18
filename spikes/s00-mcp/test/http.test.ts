import assert from 'node:assert/strict';
import { once } from 'node:events';
import { request as httpRequest } from 'node:http';
import { after, before, describe, it } from 'node:test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {
  CallToolResultSchema,
  InitializeResultSchema,
  JSONRPCErrorResponseSchema,
  JSONRPCResultResponseSchema,
  ListToolsResultSchema,
  RequestIdSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createSpikeHandler } from '../src/http.js';
import { createNodeServer } from '../src/node.js';
import { createSpikeServer } from '../src/server.js';
import worker from '../src/worker.js';

const headers = {
  accept: 'application/json, text/event-stream',
  'content-type': 'application/json',
  'mcp-protocol-version': '2025-11-25',
};
const expectedStatus = { dataset: 's00', synthetic: true, status: 'ok' };
// SDK 1.32.1 transport errors use id:null, although its exported schema only
// permits string/number/omitted IDs. Keep that observed wire behavior explicit.
const errorResponse = JSONRPCErrorResponseSchema.extend({ id: RequestIdSchema.nullable().optional() });
const initialize = (protocolVersion = '2025-11-25') => ({
  jsonrpc: '2.0', id: 1, method: 'initialize',
  params: { protocolVersion, capabilities: {}, clientInfo: { name: 'offline-test', version: '1' } },
});
const call = (args: unknown = { dataset: 's00' }) => ({
  jsonrpc: '2.0', id: 3, method: 'tools/call',
  params: { name: 'read_synthetic_status', arguments: args },
});

async function result(response: Response): Promise<Record<string, unknown>> {
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') ?? '', /application\/json/);
  return JSONRPCResultResponseSchema.parse(await response.json()).result;
}

// Run the same observable contract through real Node HTTP and the Worker fetch
// entry in Node. The latter is NOT evidence of a live Cloudflare runtime.
for (const adapter of ['node-http', 'worker-fetch-in-node'] as const) {
  describe(adapter, { timeout: 10_000 }, () => {
    let endpoint = 'http://127.0.0.1:8787/mcp';
    let send: (request: Request) => Promise<Response> = worker.fetch;
    const post = (body: unknown, extraHeaders: Record<string, string> = {}) => send(new Request(endpoint, {
      method: 'POST', headers: { ...headers, ...extraHeaders }, body: JSON.stringify(body),
    }));

    if (adapter === 'node-http') {
      const server = createNodeServer();
      before(async () => {
        server.listen(0, '127.0.0.1');
        await once(server, 'listening');
        const address = server.address();
        assert.ok(address && typeof address !== 'string');
        endpoint = `http://127.0.0.1:${address.port}/mcp`;
        send = (request) => fetch(request);
      });
      after(() => new Promise<void>((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
      }));
    }

    for (const version of ['2025-11-25', '2025-06-18']) {
      it(`initializes at ${version} without creating a session`, async () => {
        const response = await post(initialize(version));
        assert.equal(response.headers.get('mcp-session-id'), null);
        const initialized = InitializeResultSchema.parse(await result(response));
        assert.equal(initialized.protocolVersion, version);
        assert.equal(initialized.serverInfo.name, 'fortnox-mcp-s00-spike');
        assert.ok(initialized.capabilities.tools);
        assert.equal(initialized.capabilities.resources, undefined);
        assert.equal(initialized.capabilities.prompts, undefined);
        const notification = await post({ jsonrpc: '2.0', method: 'notifications/initialized' }, {
          'mcp-protocol-version': version,
        });
        assert.equal(notification.status, 202);
        assert.equal(await notification.text(), '');
        const listed = ListToolsResultSchema.parse(await result(await post({
          jsonrpc: '2.0', id: 2, method: 'tools/list',
        }, { 'mcp-protocol-version': version })));
        assert.equal(listed.tools.length, 1);
      });
    }

    it('discovers exactly one tool with strict schemas and truthful annotations', async () => {
      const listed = ListToolsResultSchema.parse(await result(await post({
        jsonrpc: '2.0', id: 2, method: 'tools/list',
      })));
      assert.equal(listed.tools.length, 1);
      const tool = listed.tools[0];
      assert.ok(tool);
      assert.equal(tool.name, 'read_synthetic_status');
      assert.equal(tool.inputSchema.additionalProperties, false);
      assert.deepEqual(tool.inputSchema.required, ['dataset']);
      assert.equal(tool.outputSchema?.additionalProperties, false);
      assert.deepEqual(tool.annotations, {
        readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false,
      });
    });

    it('returns deterministic synthetic data in both text and structured content', async () => {
      const response = CallToolResultSchema.parse(await result(await post(call())));
      assert.notEqual(response.isError, true);
      assert.deepEqual(response.structuredContent, expectedStatus);
      assert.deepEqual(response.content, [{ type: 'text', text: JSON.stringify(expectedStatus) }]);
    });

    it('works with the official SDK client over Streamable HTTP', async () => {
      const client = new Client({ name: 's00-offline-client', version: '1' });
      const transport = new StreamableHTTPClientTransport(new URL(endpoint), {
        fetch: (input, init) => send(new Request(input, init)),
      });
      try {
        await client.connect(transport);
        assert.equal((await client.listTools()).tools.length, 1);
        const response = await client.callTool({ name: 'read_synthetic_status', arguments: { dataset: 's00' } });
        assert.deepEqual(response.structuredContent, expectedStatus);
      } finally {
        await client.close();
      }
    });

    for (const [name, args] of [
      ['missing required field', {}],
      ['wrong type', { dataset: 42 }],
      ['wrong fixture', { dataset: 'production' }],
      ['unknown field', { dataset: 's00', company_id: 'synthetic-company' }],
    ] as const) {
      it(`rejects tool input: ${name}`, async () => {
        const response = CallToolResultSchema.parse(await result(await post(call(args))));
        assert.equal(response.isError, true);
        assert.equal(response.structuredContent, undefined);
      });
    }

    it('rejects an unknown tool without exposing a success payload', async () => {
      const response = CallToolResultSchema.parse(await result(await post({
        ...call(), params: { name: 'create_manual_voucher', arguments: {} },
      })));
      assert.equal(response.isError, true);
      assert.equal(response.structuredContent, undefined);
    });

    for (const [name, body, status, code] of [
      ['malformed JSON', '{', 400, -32700],
      ['invalid JSON-RPC envelope', JSON.stringify({ jsonrpc: '1.0', id: 1, method: 'tools/list' }), 400, -32700],
      ['unknown method', JSON.stringify({ jsonrpc: '2.0', id: 9, method: 'unsupported' }), 200, -32601],
      // The pinned SDK maps these schema failures to -32603, not -32602.
      ['invalid initialize params', JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }), 200, -32603],
      ['non-object arguments', JSON.stringify(call([])), 200, -32603],
    ] as const) {
      it(`rejects ${name}`, async () => {
        const response = await send(new Request(endpoint, { method: 'POST', headers, body }));
        assert.equal(response.status, status);
        assert.equal(errorResponse.parse(await response.json()).error.code, code);
      });
    }

    it('negotiates the pinned SDK version for the unimplemented 2026 revision', async () => {
      const initialized = InitializeResultSchema.parse(await result(await post(initialize('2026-07-28'))));
      assert.equal(initialized.protocolVersion, '2025-11-25');
      const response = await post(call(), { 'mcp-protocol-version': '2026-07-28' });
      assert.equal(response.status, 400);
      assert.equal(errorResponse.parse(await response.json()).error.code, -32000);
    });

    for (const [name, extraHeaders, status] of [
      ['missing event-stream accept', { accept: 'application/json' }, 406],
      ['wrong content type', { 'content-type': 'text/plain' }, 415],
      ['foreign origin', { origin: 'https://example.invalid' }, 403],
      ['null origin', { origin: 'null' }, 403],
    ] as const) {
      it(`rejects ${name}`, async () => {
        const response = await post(call(), extraHeaders);
        assert.equal(response.status, status);
        await response.text();
      });
    }

    it('accepts an explicit same origin', async () => {
      const response = await post(call(), { origin: new URL(endpoint).origin });
      assert.deepEqual(CallToolResultSchema.parse(await result(response)).structuredContent, expectedStatus);
    });

    it('rejects bodies over the 16 KiB bound', async () => {
      const response = await post(call({ dataset: 's00', padding: 'x'.repeat(17 * 1024) }));
      assert.equal(response.status, 413);
      await response.text();
    });

    for (const method of ['GET', 'DELETE', 'PUT', 'OPTIONS']) {
      it(`rejects unsupported ${method} instead of opening persistent streams`, async () => {
        const response = await send(new Request(endpoint, { method }));
        assert.equal(response.status, 405);
        assert.equal(response.headers.get('allow'), 'POST');
        await response.text();
      });
    }

    it('returns 404 outside /mcp', async () => {
      const response = await send(new Request(new URL('/other', endpoint)));
      assert.equal(response.status, 404);
      await response.text();
    });

    it('keeps concurrent request IDs and results independent', async () => {
      await Promise.all(Array.from({ length: 10 }, async (_, id) => {
        const response = await post({ ...call(), id });
        const rpc = JSONRPCResultResponseSchema.parse(await response.json());
        assert.equal(rpc.id, id);
        assert.deepEqual(CallToolResultSchema.parse(rpc.result).structuredContent, expectedStatus);
      }));
    });

    it('rejects a non-local host', async () => {
      if (adapter === 'node-http') {
        // Node fetch controls Host itself; use HTTP directly to test rebinding.
        const status = await new Promise<number | undefined>((resolve, reject) => {
          const request = httpRequest(endpoint, {
            method: 'POST', headers: { ...headers, host: 'example.invalid' },
          }, (response) => {
            response.resume();
            response.on('end', () => resolve(response.statusCode));
            response.on('error', reject);
          });
          request.on('error', reject);
          request.end(JSON.stringify(call()));
        });
        assert.equal(status, 403);
        return;
      }
      const response = await send(new Request('https://example.invalid/mcp', {
        method: 'POST', headers: { ...headers, host: 'example.invalid' }, body: JSON.stringify(call()),
      }));
      assert.equal(response.status, 403);
      await response.text();
    });
  });
}

describe('output validation at the server boundary', () => {
  for (const [name, invalidOutput] of [
    ['extra field', { ...expectedStatus, private_note: 'must-not-leak' }],
    ['missing field', { dataset: 's00', status: 'ok' }],
    ['wrong type', { ...expectedStatus, synthetic: 'true' }],
  ] as const) {
    it(`blocks ${name} before returning text or structured content`, async () => {
      const handler = createSpikeHandler(() => createSpikeServer(() => invalidOutput));
      const response = await handler(new Request('http://localhost/mcp', {
        method: 'POST', headers, body: JSON.stringify(call()),
      }));
      const toolResult = CallToolResultSchema.parse(await result(response));
      assert.equal(toolResult.isError, true);
      assert.equal(toolResult.structuredContent, undefined);
      assert.deepEqual(toolResult.content, [{ type: 'text', text: 'Synthetic output failed validation' }]);
    });
  }
});
