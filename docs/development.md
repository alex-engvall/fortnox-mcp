# Development setup contract

The first [S00 spike](../spikes/s00-mcp/README.md) is runnable in `spikes/s00-mcp`, with its own package and lockfile. Use its documented commands for synthetic local tests. There are no root npm commands, authenticated server or Fortnox connection. S01 must implement and verify the supported workspace described below.

## Intended setup

1. Install the supported Node.js LTS and package-manager version recorded in the repository by S01.
2. Clone the repository, install from the committed lockfile and copy a documented environment example.
3. Start the Node adapter with synthetic fixtures for tests; connect an authorized Fortnox test company only for integration work.
4. Run type checking, formatting, lint and behavior tests.
5. For the Worker adapter, use the locally pinned Cloudflare development tooling and equivalent test fixtures.

Use a single package manager; the initial recommendation is npm workspaces to minimize setup dependencies. S01 records the actual choice and supported OS commands. Windows, macOS and Linux instructions should be checked rather than assuming Unix shell syntax works everywhere.

## Intended command names — not available yet

| Command | Required behavior when implemented |
| --- | --- |
| `npm ci` | Reproduce locked dependencies |
| `npm run dev` | Run local Node development server without exposing it publicly |
| `npm run dev:worker` | Run Worker adapter locally |
| `npm run typecheck` | Strict TypeScript checks |
| `npm run lint` | Static lint and formatting checks |
| `npm test` | Offline unit/contract tests with synthetic data |
| `npm run test:integration` | Explicit opt-in Fortnox test-company suite |
| `npm run test:clients` | Client acceptance harness/manual evidence instructions |
| `npm run build` | Build runtime artifacts and MCP UI |

## Learning path for new TypeScript contributors

Start with the pure voucher validator: typed inputs, runtime parsing, exact decimal values, a result union and table-driven tests. Then follow a read-only tool through authentication, company authorization, domain service and provider adapter. Add mutation/retry behavior only after understanding those boundaries.

Use small modules, explicit return types at public boundaries and clear error codes. Avoid broad `any`, unchecked casts, global mutable current-company state and implicit defaults for financial years. Prefer clear code to abstraction layers that do not yet solve a real problem.

## External specification

Place an authorized copy at `vendor-specs/fortnox/openapi.json` (gitignored). Compare its SHA-256 with [source-lock](reference/source-lock.json). Differences require a reviewed coverage/schema diff; do not silently overwrite generated definitions. Fix upstream inconsistencies through versioned overlays with source/evidence, never by editing an untracked source file and forgetting the change.
