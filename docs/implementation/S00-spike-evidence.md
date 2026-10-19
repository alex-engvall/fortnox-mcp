# S00 evidence — first isolated transport spike

Status: **partial offline evidence; S00 remains in progress and no gate is closed**.

This is the original transport-only snapshot. Later isolated live results,
including scoped G04 acceptance, are summarized in the
[current S00/S01 handoff](S00-S01-handoff.md); the historical gap table below
does not replace that current status.
Recorded on 2026-10-18. Server/test commit:
[`0fc54b73652d722efc0cce5fc2349eaa1e16d761`](https://github.com/alex-engvall/fortnox-mcp/commit/0fc54b73652d722efc0cce5fc2349eaa1e16d761).
The following documentation commit does not change that executable snapshot.

## Scope and environment

This slice addresses local initialization, discovery, a harmless synthetic
read-only tool, strict input/output validation and a portable HTTP boundary.
It does not meet full S00 acceptance. No Fortnox credentials, company data,
accounting mutations or provider calls were used. No website files were changed.
No MCP endpoint was deployed, and no PR was merged.

Execution environment: Linux x64, Node.js `v24.19.0`, npm `11.9.0`.
The official SDK client `1.32.1` is the only tested client, locally. There was no
ChatGPT/Claude/Codex account or workspace connection, browser UI or test company.
No authentication component is selected: the unauthenticated fixture is bound
to loopback, rejects non-local hosts and checks supplied Origin headers.

The [package](../../spikes/s00-mcp/package.json) and
[lockfile](../../spikes/s00-mcp/package-lock.json) pin the official SDK
`1.32.1`, Zod `4.6.7`, `@cfworker/json-schema` `4.1.1`, Node adapter `2.1.5`,
TypeScript `7.0.2`, tsx `4.23.15`, esbuild `0.28.2` and Node types `24.19.2`.
Dependency licenses and redistribution strategy are recorded in
[third-party notices](../../THIRD_PARTY_NOTICES.md#s00-isolated-spike-dependencies).
No Fortnox source was copied or used to generate code.

## Commands and observed results

Commands ran from `spikes/s00-mcp`, after a clean lockfile install. Tests use only
in-process requests and loopback HTTP; package installation uses the registry.

| Command | Actual result |
| --- | --- |
| `npm ci --ignore-scripts` | Passed; 103 installed packages, no lifecycle scripts |
| `npm run typecheck` | Passed; strict TypeScript, including the Worker graph without ambient Node types |
| `npm test` | 61 passed, 0 failed, 0 skipped; 3 suites |
| `npm run build` | Passed; Node ESM output and browser-platform Worker bundle (about 1.4 MB unminified; size warning, not a runtime-budget measurement) |
| `npm run test:build` | 2 passed, 0 failed, 0 skipped; built Node entry served the tool over loopback, Worker bundle served the tool in Node with dynamic code generation disabled |
| `npm ls --depth=0` | All eight direct dependency versions matched the pins |
| `npm sbom --sbom-format cyclonedx --omit=dev` | Generated an installed runtime inventory locally; no release artifact published |
| `git diff --check` (repository root) | Passed; no whitespace errors |

A repository-wide relative-link check passed for 176 file links across 54 Markdown
files. The changed-path check confirmed that `index.html` and `site/` are unchanged.

An additional local smoke check started `node --import tsx src/node.ts`, performed
`initialize` over loopback HTTP and stopped the process: startup and negotiation
of `2025-11-25` passed. The repeatable built-entry check is in
[build.test.mjs](../../spikes/s00-mcp/test/build.test.mjs).

The [main tests](../../spikes/s00-mcp/test/http.test.ts) run the same contract
through real Node HTTP and the Worker-style fetch entry **in Node**:

- Initialization and initialized notification, with no session ID, at
  `2025-11-25` and `2025-06-18`; discovery after initialization.
- Exactly one synthetic tool, strict published schemas, accurate annotations,
  deterministic text/structured output and the official SDK client's lifecycle.
- Rejection of missing/unknown fields, wrong types/fixture, unknown tool/method,
  malformed JSON/envelope, invalid initialization and non-object tool arguments.
- Rejection of unsupported headers/protocol, oversized bodies, non-local hosts,
  foreign/null Origin, unsupported HTTP methods and unknown paths.
- Concurrent requests retain their own IDs/results. This is transport isolation,
  not company authorization, concurrency control for writes or storage evidence.
- Fault-injected invalid output (missing field, wrong type, extra field) fails
  before either text or structured success content can escape.

## Observed SDK limitations and choices

The installed SDK reports `2025-11-25` as its latest revision. Requesting
`2026-07-28` during initialization negotiates back to `2025-11-25`; sending
`MCP-Protocol-Version: 2026-07-28` on a subsequent request returns HTTP 400.
This is **not** implementation or verification of the newer protocol referenced
by the client contract. Other revisions listed by the SDK were not tested.

SDK 1.32.1 returns `id: null` for transport errors, although its exported
`JSONRPCErrorResponseSchema` excludes null. The test decoder explicitly allows
the observed null ID. Invalid initialization parameters and non-object tool
arguments return JSON-RPC `-32603`; malformed JSON/envelopes return `-32700`.
Unknown methods return `-32601`. Tool-level schema failures/unknown names return
HTTP 200 with `isError: true` and no structured success content. Tests preserve
these observations; they do not establish comprehensive protocol conformance.
Reassess these error semantics when selecting production SDK/protocol versions.

The experiment uses stateless JSON responses under Streamable HTTP. It has no
session enforcement, persistent SSE, reconnect/replay store or durable state.
Initialization does not authorize later requests. The portable boundary and
Worker bundle are candidates for S01; no production runtime/storage decision or
Cloudflare resource-budget claim follows from this slice.

## Unresolved S00 gates and prerequisites

| Gate | Status / evidence from this slice | Still required before closing |
| --- | --- | --- |
| G01 Client protocol/auth | **Unverified**. Local SDK negotiation/discovery only; newer revision unsupported by this pin. | Select an auth component and intended SDK/protocol; provision an authenticated HTTPS test endpoint; establish the actual ChatGPT plan/workspace permissions and record hosted test date, metadata, audience/token/redirect behavior and connection evidence. None of these account prerequisites is yet verified. |
| G02 Embedded review boundary | **Unverified; not implemented**. Review-required execution remains unavailable. | Synthetic UI and immutable owner/proposal binding; real target-host evidence for UI-only action, forged/replayed/model-origin calls and explicit trusted-host assumptions. Visibility alone cannot close this gate. |
| G03 Multi-file transfer | **Unverified; not implemented**. No file ingress/egress exists. | Two synthetic receipts in the actual client; input/output schemas, expiry, size/type limits, failed downloads and output retrieval evidence. |
| G04 Service/user connection | **Unverified; not implemented**. No provider request made. | Owner-provisioned allowlisted Fortnox test company and credentials outside git; service consent/client-credentials and user-refresh probes; observed company, TenantId and `/me` identity semantics. |
| G05 Source provenance | **Unverified**. Dependencies pinned with integrity/license metadata; no generated or vendored Fortnox source. | Establish authorized specification acquisition/redistribution and generated-output licensing; verify acquisition date and hash against the existing source lock before redistribution. |
| G09 Runtime budgets | **Unverified**. Node tests, Worker typecheck/bundle and fetch tests in Node only. | Actual Worker/workerd and Node measurements for representative catalog, decimals, files and SIE; memory/CPU/size budgets and atomic durable-storage evaluation. |

G06–G08 and G10–G12 are unchanged and unverified. There is no evidence here for
financial correctness, recovery, payroll, workflow breadth or production security.
The next S00 slice must obtain the relevant live prerequisites and retain disabled
capabilities where evidence is missing. No weaker approval fallback is introduced.
