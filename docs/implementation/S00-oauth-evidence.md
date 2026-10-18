# S00 OAuth feasibility evidence

Status: **local Node and workerd/D1 evidence; live G01 remains open**.
Recorded 2026-10-18. This record covers the isolated
[OAuth probe](../../spikes/s00-oauth/README.md), not S02 or a production release.

Executable snapshot:
[`bc2878990d137415724f91ea97e07d2cd17e8557`](https://github.com/alex-engvall/fortnox-mcp/commit/bc2878990d137415724f91ea97e07d2cd17e8557).

## Scope and choices

Better Auth and `@better-auth/oauth-provider` `1.7.10` provide the OAuth and
one-time-login implementation on Node SQLite and Worker D1. The probe uses
resource-bound opaque access tokens, validated against the provider database on
every request, to support immediate revocation. It adds only application-level
owner/resource/scope checks; it implements no OAuth signing, code generation,
hashing, PKCE or token rotation itself. No external identity service or model API
key is required for this synthetic test.

Authorization codes and signed browser-login queries expire after ten minutes
(the provider's standard default); access tokens and one-time login codes
expire after five minutes. Refresh tokens and the synthetic operator session
expire after 24 hours. The signed login query initially used two minutes, which
was too short for the manual file-to-browser handoff; this was adjusted before
the recorded executable snapshot. Expiry/replay remain enforced by the library.

The official MCP SDK remains `1.32.1`, with stateless JSON Streamable HTTP and
the cfworker validator. No embedded UI, files, Fortnox operation or financial
write is enabled. The existing infrastructure installation is unaffected.

## Observed local verification

Windows x64, Node `24.19.0`, npm `11.9.0`; pinned dependency install with lifecycle
scripts disabled. The Worker test uses local workerd/Miniflare `5.20261012.1-beta`
and D1, with the same bundled source and auth library used by the Worker entry.

Behavioral tests cover discovery/challenge, DCR, signed consent, S256 PKCE,
RFC 9207 callback issuer/state, the authenticated synthetic MCP tool, expiry,
code reuse, wrong verifier/resource/redirect, another installation, modified
consent scopes, same-origin session protection, body limits, bootstrap replay,
refresh rotation and immediate denial after logout/revocation. The D1 scenario
covers one-time login, discovery, authorization, consent, code exchange, tool
call, refresh and revocation. These are component tests, not exhaustive security
or production acceptance.

`npm run typecheck`, `npm run build` and all **8 behavioral tests** passed locally.
Biome subsequently passed without warnings after formatting and explicit
protocol-field assertions. The new `s00-oauth-offline` CI workflow runs a fresh
locked install, typecheck, lint, Worker build, the Node/workerd tests and a
credential-free Wrangler dry run. Hosted CI results are recorded separately
when available.

The signed-login continuation test caught an invalid use of `/oauth2/continue`;
the login page now resumes the provider's validated authorize endpoint before
requesting consent. The tests distinguish API/fetch JSON redirects from browser
navigation redirects.

Wrangler's credential-free dry run succeeded: approximately 3,697 KiB upload,
636 KiB gzip. This measures bundle size only; no hosted CPU/memory/free-tier
claim follows. The configured Worker requires `nodejs_compat`; G09 runtime
benchmarks remain pending.

## Live prerequisites and remaining evidence

Wrangler was not authenticated initially. The owner approved a scoped login for
one selected account: User Read, Account Read, Workers Scripts Write, D1 Write
and Background Access. Login succeeded; credentials are stored as an encrypted
Wrangler file with its key in Windows Credential Manager. The isolated D1
database was created in EEUR and the synthetic auth schema/owner imported.
The separate Worker deployed successfully (reported startup 92 ms), followed by
its two secret bindings. No existing application database was used. Remote
resource/server metadata returned 200; unauthenticated `/mcp` returned 401 with
the protected-resource challenge. Startup and bundle size are not CPU-budget
benchmarks. No credentials or account/database identifiers are stored here.

In the observed personal ChatGPT Pro account, Plugins → Add custom MCP server
successfully discovered the deployed authorization/token/registration URLs,
issuer, resource, both scopes and DCR support. OIDC/CIMD were unavailable as
intentionally not advertised. The connection was configured with base scope
`mcp:read` and default scopes `mcp:read offline_access`. The browser reached the
ChatGPT account-linking consent dialog; owner login/consent and an actual chat
tool call are still pending. A separate private portable plugin package was
saved, but its detail page alone did not complete a ChatGPT MCP connection.
Actual negotiated protocol, refresh/reconnection and failure behavior must be
recorded from the live run. G01 remains open.

G02 embedded review, G03 multi-file transfer, G04 Fortnox test-company flows,
G05 authorized source redistribution and G09 representative budgets remain open.
G12 production owner bootstrap, lifecycle hardening and confidential report
submission remain unverified. S00 and S01 are not fully accepted by this slice.
