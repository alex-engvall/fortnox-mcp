# S00 synthetic Streamable HTTP spike

Experimental, local-only feasibility code. This is the first isolated slice of
[S00](../../docs/implementation/S00-feasibility.md), not an installable Fortnox
integration. No authentication, company connections, accounting operations,
embedded UI, files or durable storage are implemented. Do not expose this
unauthenticated endpoint through a tunnel or reverse proxy.

## Run and verify

Prerequisites: Node.js 24 LTS and npm 11.9.0. Commands run in this directory,
independently of the project website. No credentials or environment file needed.

```sh
cd spikes/s00-mcp
npm ci --ignore-scripts
npm run typecheck
npm test
npm run build
npm run test:build
npm start
```

`npm start` serves `http://127.0.0.1:8787/mcp`; stop with Ctrl+C.
`npm run dev` runs the TypeScript entry directly. The build smoke test briefly
uses port 8787, so stop a running spike before running it. The main test suite
uses an ephemeral loopback port and an in-process fetch adapter. Tests do not
contact any external service; installing dependencies requires registry access
or a populated npm cache. There is no deployment command or Worker configuration.

The [S00 CI workflow](../../.github/workflows/s00-ci.yml) runs these five checks
on every PR and on pushes to `main`, with Node 24.19.0 and npm 11.9.0.
Its check name is `s00-offline`; see [CI evidence and merge enforcement status](../../docs/implementation/S00-ci-evidence.md).

## Contract and boundaries

- Official `@modelcontextprotocol/sdk` 1.32.1, using
  `WebStandardStreamableHTTPServerTransport`. Fresh server/transport per request,
  JSON response mode, no sessions or persistent SSE streams. Clients can send
  requests without a prior initialization in this stateless mode; initialization
  is not an authentication boundary.
- Only `POST /mcp`. Other methods return 405 (`Allow: POST`); other paths return
  404. Only loopback hostnames are accepted. A supplied Origin must match the
  request origin; foreign and `null` origins return 403. No CORS access is granted.
- POST requires `Content-Type: application/json` and an Accept header containing
  both `application/json` and `text/event-stream`. Body limit: 16 KiB, enforced by
  the SDK before parsing. The optional `MCP-Protocol-Version` follows SDK rules.
- One tool, `read_synthetic_status`, accepts exactly `{"dataset":"s00"}` and
  returns `{"dataset":"s00","synthetic":true,"status":"ok"}` as both JSON text
  and structured content. Strict Zod schemas reject unknown fields, wrong types
  and missing fields. Output is parsed before serialization and also checked by
  the SDK. Tool errors never contain an invalid producer result.
- Annotations: read-only, non-destructive, idempotent, closed-world. The fixture
  is independent of companies and performs no I/O. These annotations do not
  establish authorization or approval. Every Fortnox capability remains disabled.

## Portability and known limits

`src/status.ts` contains the fixture and schemas. `src/server.ts` owns the MCP
registration; `src/http.ts` uses only web Request/Response APIs. `src/node.ts`
adapts Node HTTP using `@hono/node-server`. `src/worker.ts` exports a Worker-style
fetch handler. The SDK uses its `CfWorkerJsonSchemaValidator` provider to avoid
schema compilation through dynamic code generation.

Typechecking the Worker dependency graph excludes ambient Node types, and the
Worker entry bundles with esbuild's browser platform. Offline tests exercise
the same contract through Node HTTP and the Worker fetch entry **in Node**.
The bundle smoke test disables dynamic code generation in Node. None of these
checks proves a Cloudflare deployment, runtime budgets or durable storage.

The pinned SDK negotiates `2025-11-25` and `2025-06-18` in the offline tests.
An initialization requesting `2026-07-28` falls back to `2025-11-25`; a subsequent
request carrying a `2026-07-28` header fails. No support for that revision is claimed.
SDK error-shape limitations and all open gates are recorded in the
[evidence record](../../docs/implementation/S00-spike-evidence.md).

S01 decides which parts become supported structure. Remote use still requires
the authenticated boundary and actual client acceptance specified by S00/S02.
