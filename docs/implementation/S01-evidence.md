# S01 foundation and S00 reverification

Recorded on 2026-10-18 against merged base `f14cd27` (PR #7), with the source and
root lockfile accompanying this record. Environment: Linux x64, Node 24.19.0,
npm 11.9.0. All financial-looking values, identities and intent hashes are synthetic.
No Fortnox request, accounting mutation, remote deployment or package release
occurred in that foundation run. Later isolated live probes are recorded below.

## S00 status checked against code

The preserved `spikes/s00-mcp` package was installed from its own lockfile.
`npm run typecheck`, `npm test`, `npm run build` and `npm run test:build` passed:
**61 behavior tests + 2 built-artifact tests**, no failures or skips. Thus the
**offline transport spike is verified**. Existing hosted CI evidence is in
[S00 CI evidence](S00-ci-evidence.md).

Full S00 is still in progress: inspection confirms there is no remote auth,
embedded approval, client file transfer or Fortnox connection in the spike.
G01–G05/G09 cannot be closed by these offline results. S01 adds local workerd/D1
evidence but does not supply hosted-client or representative runtime-budget
measurements. See [remaining gates](S00-spike-evidence.md#unresolved-s00-gates-and-prerequisites).

The supplied OpenAPI file was hashed locally and matches the existing source
lock (`bee13230dab8fbc4e9e3339073299552a1cac5f253b05e705c928e4fa81bb4aa`).
This checks snapshot identity only; acquisition/redistribution rights remain G05.
No external specification is committed or used for code generation.

## Implemented S01 slice

- Private npm workspaces: portable core, disabled provider module, shared MCP
  transport, minimal bilingual UI module, Node and Worker entries.
- Strict TypeScript, input/output schema validation, exact decimal text parsing
  and sums with explicit scale, bounded operands and no float intermediate.
- Server identity/company authorization primitive and HTTP/clock/secret/logger
  interfaces; no OAuth/admin implementation or private-data endpoint.
- SQLite and D1 adapters sharing immutable intent creation and atomic compare-
  and-set transitions. Owner/company keys isolate operations. Expired prepared
  intents cannot be claimed; uncertain outcomes are retained and cannot be
  automatically resubmitted. No provider idempotency guarantee is implied.
- Shared contract tests in SQLite and real local workerd/D1. Additional restart
  tests close/reopen SQLite and dispose/restart workerd with persistent D1.
- Node/Worker synthetic read-only fixture on loopback, strict schemas, fixed
  startup logging, foreign-Origin and remote-host rejection, 16 KiB request bound.
- Root install/dev/typecheck/lint/test/build commands, placeholder-only environment
  example, local D1 migration, pinned dependencies and secret-free CI.

## Verification

Commands below run from the repository root unless stated otherwise:

| Check | Observed result |
| --- | --- |
| `npm ci --ignore-scripts` | Clean locked install passed; lifecycle scripts disabled |
| `npm run typecheck` | Source, Worker graph without ambient Node types, and tests/config passed |
| `npm run lint` | Biome recommended rules and formatting passed |
| `npm test` | 24 Node/domain/restart tests and 9 actual local workerd/D1 tests passed |
| `npm run build` | Node, browser-platform Worker and minimal UI bundles built |
| `npm run test:build` | 2 passed; built Node startup and Worker bundle without dynamic code generation in Node |
| `npm run dev` / `npm run dev:worker` | Both started and served the synthetic tool over loopback, using ports 8790/8791; then stopped |
| Local Wrangler D1 migration | `0001_execution_intents.sql` applied successfully to the local placeholder database |
| `test:integration` / `test:clients` | Both correctly report missing acceptance implementation and exit 1, with no external test calls |
| `npm ls --depth=0` | Direct packages match exact pins |
| `npm sbom --sbom-format cyclonedx --omit=dev` | Runtime inventory generated locally in ignored `dist/`; no release artifact published |

All 194 relative Markdown file links checked and tracked-file `git diff --check`
passed. The original S00 CI workflow and website sources are unchanged.

The SDK transport/validator/version remains the S00-tested `1.32.1`. This does
not implement MCP `2026-07-28`. The production source keeps strict optional-
property checks; test compilation relaxes only that option for the pinned SDK's
incompatible `sessionId` declaration. Worker compilation has no ambient Node types.

The Cloudflare test plugin pins beta Miniflare. Upstream SDK source maps refer
to absent source files, producing test-run warnings. Wrangler could not retrieve
its optional `Request.cf` metadata through this environment's network policy;
local synthetic HTTP and D1 tests do not depend on that metadata. These results
are local runtime evidence, not hosted Cloudflare, free-tier or scale acceptance.

## Remaining acceptance and release limits

Remote authentication, owner bootstrap, provider consent, embedded approval,
file transfer and all financial operations remain disabled/unimplemented. Core
primitives are not full T01–T22 product acceptance. `test:integration` and
`test:clients` explicitly exit nonzero with missing prerequisites rather than
pretending those integrations pass.

S00 mechanism decisions, hosted client evidence and G09 representative benchmarks
remain open. Both hosted workflows passed on source commit `0655bfda5162d1e4258ee4ca3947c5922ad82a9e` in
[PR #8](https://github.com/alex-engvall/fortnox-mcp/pull/8):
[S00 CI run 6](https://github.com/alex-engvall/fortnox-mcp/actions/runs/39123344560)
and [S01 CI run 1](https://github.com/alex-engvall/fortnox-mcp/actions/runs/39123344680).
The existing `s00-offline` workflow is unchanged.
No branch-protection settings were modified. Windows/macOS are not verified.

A read-only attempt to inspect GitHub private vulnerability reporting returned
`Forbidden`. A working confidential reporting route is therefore **not verified**;
G12 remains open and must be resolved before any installable prerelease. No
prerelease is produced here. Setup/admin/production packaging remain later scopes.

On a later read-only check on 2026-10-18, the repository API returned
`{"enabled":true}` for private vulnerability reporting, and the authenticated
GitHub Security overview displayed **Private vulnerability reporting • Enabled**.
This supersedes the earlier inability to inspect the setting. No setting was
changed and no report was submitted. Confidential submission/delivery and the
production owner/bootstrap lifecycle are still unverified; G12 remains open.

## Subsequent isolated live evidence — 2026-10-18

The separate [OAuth probe](S00-oauth-evidence.md) established a real ChatGPT
synthetic tool call, refresh after expiry, client-initiated revocation and
immediate reconnection. Renewable reconnection and protocol/maintenance limits
are tracked there; this does not enable remote auth in the root product.

The [Fortnox operator probe](S00-fortnox-evidence.md) passed G04 for one dedicated
test company and `companyinformation profile`: service consent followed by
client-credentials issuance, ordinary-user refresh rotation, exact tenant
matching, and the differing `/me` profiles. No financial mutation occurred.
This evidence resolves the scoped connection feasibility question, not durable
provider credentials, concurrent rotation or full S02 acceptance.

On source `8709b92`, all three hosted checks passed:
[S00 OAuth](https://github.com/alex-engvall/fortnox-mcp/actions/runs/39140629314),
[S00](https://github.com/alex-engvall/fortnox-mcp/actions/runs/39140629231), and
[S01](https://github.com/alex-engvall/fortnox-mcp/actions/runs/39140629263).
S00 and S01 remain in progress while their other verification gates are open.
