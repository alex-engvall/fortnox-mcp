# Development setup

The S01 npm workspace runs local synthetic MCP servers and offline tests. Node.js **24.19.0** and npm **11.9.0** are the development/CI versions (`.nvmrc`, `packageManager` and lockfile). npm **10.9.2** is also accepted and its locked install is checked for Cloudflare's build image. Linux x64 is verified; Windows and macOS instructions still need execution evidence. No Fortnox credentials or model API key are required.

## First run

From the repository root:

```sh
npm ci --ignore-scripts
npm run typecheck
npm run lint
npm test
npm run build
npm run test:build
npm run dev
```

The Node server binds to `127.0.0.1:8787`. The MCP endpoint is `/mcp`; it accepts stateless Streamable HTTP POSTs, not browser navigation. Stop with Ctrl+C. The only tool is `read_synthetic_status`, with strict input `{"dataset":"s01"}` and output `{"dataset":"s01","synthetic":true,"status":"ok"}`. No provider operations exist. Logs contain fixed startup metadata, never request payloads or credentials.

Optional: copy `.env.example` to `.env` using your editor and add `PORT=8790` to override the default port. Only the Node entry reads it. No Fortnox credentials, owner setup, remote OAuth or secret persistence are implemented. The MCP handler rejects remote hosts and foreign Origin headers, and bounds requests to 16 KiB. Keep that listener local. This is not a hosted ChatGPT connection.

## Commands

| Command | Current behavior |
| --- | --- |
| `npm ci --ignore-scripts` | Reproduce root dependencies from the lockfile without lifecycle scripts |
| `npm run dev` | Local Node server with TS source execution; optional `.env` |
| `npm run dev:worker` | Local Wrangler/workerd server on loopback; no cloud deployment |
| `npm run dev:installation` | Local preview of the separate public infrastructure-test entry |
| `npm run db:migrate:local` | Apply migrations to the local installation-preview D1 database |
| `npm run db:migrate` / `npm run deploy` | **Remote actions** using root config: migrate an owned D1 binding / migrate then publish the test Worker; requires actual resource IDs and account authorization |
| `npm run typecheck` | Strict source checks, separate Worker graph without ambient Node types, and test/config checks |
| `npm run lint` / `npm run format` | Check / fix TypeScript, JS and JSON using Biome; existing website assets are outside this change |
| `npm test` | Run both Node/domain and workerd/D1 suites using synthetic data |
| `npm run test:node` | Domain, real Node HTTP, SQLite and D1 process-restart tests |
| `npm run test:worker` | Actual local workerd HTTP and D1 adapter behavior |
| `npm run build` | Bundled `dist/node.js`, local MCP `dist/worker.js`, public test `dist/installation.js` and bilingual `dist/ui.js` |
| `npm run test:build` | Start the built Node entry and exercise the built Worker bundle with dynamic code generation disabled in Node |
| `npm run test:integration` | Explicitly fails with the missing Fortnox acceptance prerequisites; makes no provider calls |
| `npm run test:clients` | Explicitly fails with the missing hosted-client acceptance prerequisites |

`test:integration` and `test:clients` are honest unavailable-entry checks, not passing integration tests. Neither is part of the offline CI success criteria.

The official SDK 1.32.1 and transport/validator choices are retained from the verified S00 spike. The fixture negotiates `2025-11-25` and `2025-06-18`, not the newer protocol mentioned in the target design. No auth component has yet passed the S00 hosted-client gate. Test compilation disables `exactOptionalPropertyTypes` to accommodate the SDK's incompatible `sessionId` declaration; production source retains that check and all three configurations retain strict mode.

## Storage foundation

`SqliteIntentStore` and `D1IntentStore` share an atomic SQL intent implementation. Apply `apps/worker/migrations/0001_execution_intents.sql` before using an adapter. Node callers supply a `node:sqlite` database connection. The shared migration contains only operational IDs, hashes, expiry and states, not financial payloads or secrets.

For the local Wrangler database:

```sh
npx wrangler d1 migrations apply DB --local --config apps/worker/wrangler.jsonc
```

The checked-in all-zero database ID is a local placeholder; it is not a provisioned cloud resource. The synthetic tool does not access storage. Tests exercise the adapters directly, including concurrent claims, immutable hashes, owner/company isolation, expiry and uncertain-outcome retention. Process restart tests close/reopen SQLite and dispose/restart workerd against a persistent D1 directory. This does not establish Fortnox idempotency or safe distributed production deployment.

The Cloudflare testing dependency pins a beta Miniflare release through the current supported test plugin. Runtime versions are candidates verified locally, not a hosting or free-tier budget promise. The existing `spikes/s00-mcp` package remains independently installable and its CI check is preserved.

## External specification and remaining gates

Keep authorized external input at `vendor-specs/fortnox/openapi.json` (gitignored) and compare SHA-256 with [source-lock](reference/source-lock.json). Do not redistribute or generate publishable code before resolving G05. No source generation occurs in S01.

See [S01 evidence](implementation/S01-evidence.md) and [verification gates](reference/verification-gates.md). Remote OAuth, owner administration, private-data access, embedded approval, files, provider operations and production deployment remain disabled/unimplemented. Verify a confidential security-reporting route before any product prerelease; these private development packages are not published.

## Cloudflare installation preview

The root deployment config is separate from the loopback-only synthetic MCP config:

```sh
npm run db:migrate:local
npm run dev:installation
```

Open `http://127.0.0.1:8787/` or `/setup?lang=en`. `/health` returns minimal readiness JSON. Missing migrations/bindings return `503`; `/mcp` is always blocked on this entry. No credentials are accepted. Stop with Ctrl+C. A Wrangler dry run checks packaging without deploying:

```sh
npx wrangler deploy --dry-run --config wrangler.jsonc
```

The [website guide](website.md) covers static-page preview. See [deployment](deployment.md#first-cloudflare-test-installation) and [S11 evidence](implementation/S11-cloudflare-evidence.md) for the active button, the verified hosted installation in one existing account, GitHub connection troubleshooting and remaining acceptance checks.
