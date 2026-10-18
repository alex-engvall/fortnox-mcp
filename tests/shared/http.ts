import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { expect, it } from "vitest";

export function syntheticRequest(
  argumentsValue: unknown = { dataset: "s01" },
): Request {
  return new Request("http://localhost/mcp", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name: "read_synthetic_status", arguments: argumentsValue },
    }),
  });
}
export function httpContract(
  send: (request: Request) => Promise<Response>,
): void {
  it("initializes and calls the fixture using the official client", async () => {
    const client = new Client({ name: "s01-offline-test", version: "1" });
    try {
      await client.connect(
        new StreamableHTTPClientTransport(new URL("http://localhost/mcp"), {
          fetch: (input, init) => send(new Request(input, init)),
        }),
      );
      const tools = await client.listTools();
      expect(tools.tools).toHaveLength(1);
      expect(tools.tools[0]?.annotations).toEqual({
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      });
      const response = await client.callTool({
        name: "read_synthetic_status",
        arguments: { dataset: "s01" },
      });
      expect(response.isError).not.toBe(true);
      expect(response.structuredContent).toEqual({
        dataset: "s01",
        synthetic: true,
        status: "ok",
      });
    } finally {
      await client.close();
    }
  });
  it("rejects extra fields and arbitrary tool access", async () => {
    const invalid = await send(
      syntheticRequest({ dataset: "s01", company_id: "company_a" }),
    );
    expect(
      ((await invalid.json()) as { result: { isError: boolean } }).result
        .isError,
    ).toBe(true);
    const request = syntheticRequest();
    const body = (await request.json()) as { params: { name: string } };
    body.params.name = "create_manual_voucher";
    const response = await send(
      new Request(request.url, {
        method: "POST",
        headers: request.headers,
        body: JSON.stringify(body),
      }),
    );
    expect(
      ((await response.json()) as { result: { isError: boolean } }).result
        .isError,
    ).toBe(true);
  });
  it("blocks remote hosts, foreign origins and oversized input", async () => {
    const source = syntheticRequest();
    expect(
      (await send(new Request("https://example.invalid/mcp", source))).status,
    ).toBe(403);
    const foreign = syntheticRequest();
    foreign.headers.set("origin", "https://example.invalid");
    expect((await send(foreign)).status).toBe(403);
    expect(
      (
        await send(
          syntheticRequest({ dataset: "s01", extra: "x".repeat(17 * 1024) }),
        )
      ).status,
    ).toBe(413);
  });
}
