# S00 OAuth feasibility evidence

Status: **live ChatGPT OAuth and synthetic tool call verified; full G01 remains open**.
Recorded 2026-10-18. This record covers the isolated
[OAuth probe](../../spikes/s00-oauth/README.md), not S02 or a production release.

Executable snapshot:
[`bc2878990d137415724f91ea97e07d2cd17e8557`](https://github.com/alex-engvall/fortnox-mcp/commit/bc2878990d137415724f91ea97e07d2cd17e8557).

The successful initial OAuth, expiry and reconnection runs below use that
snapshot. Follow-up protocol diagnostics and bounded public metadata handling
are pinned at
[`15e962429c7f4e6850849cfb8e2fedb8b6d8038a`](https://github.com/alex-engvall/fortnox-mcp/commit/15e962429c7f4e6850849cfb8e2fedb8b6d8038a).

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
was increased to allow time for the manual file-to-browser handoff before the
recorded executable snapshot. Expiry/replay remain enforced by the library.

The official MCP SDK remains `1.32.1`, with stateless JSON Streamable HTTP and
the cfworker validator. In the hosted MCP server no embedded UI, files, Fortnox operation or financial
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

`npm run typecheck`, `npm run build` and the initial **8 behavioral tests** passed locally.
Biome subsequently passed without warnings after formatting and explicit
protocol-field assertions. The new `s00-oauth-offline` CI workflow runs a fresh
locked install, typecheck, lint, Worker build, the Node/workerd tests and a
credential-free Wrangler dry run. Hosted CI results are recorded separately
when available.

On verification commit `15f5c51b54ed9f5d960f95625c7a7dd1fba832df`, hosted Linux CI
passed [S00 OAuth](https://github.com/alex-engvall/fortnox-mcp/actions/runs/39133908136),
[the original S00 baseline](https://github.com/alex-engvall/fortnox-mcp/actions/runs/39133908140)
and [S01](https://github.com/alex-engvall/fortnox-mcp/actions/runs/39133908132).
The first S01 run caught an unformatted new Biome config; it was corrected and
the probe lint command now includes its configuration. No root runtime change
was needed.

The follow-up has **11 passing behavioral tests**, including anonymous fixed
schema discovery, mixed-batch denial, invalid supplied credentials, malformed
RPC framing, challenge-driven reauthorization with refresh access, and
diagnostics that suppress unknown input. Typecheck, Biome and
the Worker build passed. Hosted CI for the public-discovery source `146c74e`
passed [S00 OAuth](https://github.com/alex-engvall/fortnox-mcp/actions/runs/39136603472),
[S00](https://github.com/alex-engvall/fortnox-mcp/actions/runs/39136603464) and
[S01](https://github.com/alex-engvall/fortnox-mcp/actions/runs/39136603543).
Later follow-up CI is recorded separately when available.

The refresh-scope fix at `15e9624` passed hosted
[S00 OAuth](https://github.com/alex-engvall/fortnox-mcp/actions/runs/39138350825),
[S00](https://github.com/alex-engvall/fortnox-mcp/actions/runs/39138350820) and
[S01](https://github.com/alex-engvall/fortnox-mcp/actions/runs/39138350761).

The separate [local Fortnox operator probe](S00-fortnox-evidence.md) adds five
offline checks, bringing this package's test count to 16. It is never imported
by the hosted Worker and does not enable Fortnox access through the MCP tool.

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
The recorded executable snapshot was redeployed successfully, reporting startup
104 ms; this still does not establish a runtime budget.

In the observed personal ChatGPT Pro account, Plugins → Add custom MCP server
successfully discovered the deployed authorization/token/registration URLs,
issuer, resource, both scopes and DCR support. OIDC/CIMD were unavailable as
intentionally not advertised. The connection was configured with base scope
`mcp:read` and default scopes `mcp:read offline_access`. The browser reached the
ChatGPT account-linking consent dialog. A separate private portable plugin package was
saved; the observed catalog marks that raw MCP package desktop-only. The actual
ChatGPT test uses the separate custom-MCP app/connection, which was saved and
can be resumed with Connect. ChatGPT reached the provider's signed `/sign-in`
redirect with DCR client ID, state, S256 challenge and exact resource. Browser
automation then lost access to that OAuth tab. A fresh tab could show the public
probe homepage, and a direct HTTPS check of `/sign-in` returned 200. These facts
did not establish completed login or consent. The owner subsequently completed
both steps privately, as recorded below.

### Live ChatGPT result — 2026-10-18

The owner signed in on the short `/sign-in` page using a fresh five-minute code,
then resumed the existing saved ChatGPT connection. This avoids spending the
signed OAuth query's lifetime locating the local code file. An earlier expired
signed URL returned `Invalid OAuth query`; it was discarded, not edited or
accepted with weaker validation. The fresh flow reached the owner-only consent
page with `mcp:read offline_access`. The owner approved it and ChatGPT returned
to the saved plugin without the Connect button.

In a new ChatGPT conversation, selecting the private custom-MCP plugin and
requesting one `read_synthetic_status` call produced an actual tool activity
entry and the result:

```json
{"dataset":"s00-oauth","authenticated":true,"fortnoxEnabled":false}
```

The UI showed the completed synthetic-status activity and reported one call.
This verifies the hosted metadata/DCR → owner login → consent → callback/code
exchange → authenticated tool path with SDK `1.32.1`, Better Auth `1.7.10`,
stateless JSON Streamable HTTP and a personal ChatGPT Pro account in Chrome.
The server source is the executable snapshot pinned above; no server change
was needed to complete this flow. Screenshots remain outside the repository;
no credentials, signed login URLs or private conversation links are committed.

Read-only aggregate D1 queries observed four access-token records and four
refresh-token records, three marked rotated. Issuance spanned 14:12:40–14:13:54
UTC, with the latest access-token expiry at 14:18:54 UTC. Only ChatGPT used the
remote grant. This establishes live refresh rotation before expiry; it does not
by itself establish reuse after expiry or revocation/reconnection behavior.

A second ChatGPT prompt requested a new tool call after all previously observed
access tokens had expired. A bounded local real-time-log filter observed
`POST /auth/oauth2/token` 200 at 14:19:35 UTC, followed by `POST /mcp` 200 at
14:19:37 UTC. D1 aggregates then showed five access tokens and five refresh
tokens, four rotated, with the new token created at 14:19:36 UTC and expiring
at 14:24:36 UTC. ChatGPT showed a second completed tool activity and the same
synthetic JSON. Together these establish automatic refresh and continued access
after expiry, without another login or consent. A direct call through the
connected app tool in Codex also returned the same structured result; this is
not evidence for a separate generic Codex MCP transport.

The operator filter retained only timestamp, allowlisted path, method,
protocol-version header, response status and invocation outcome. It discarded
query strings, all other headers, IPs, console payloads and exceptions; Wrangler
disk logging was disabled. The observed successful MCP POST had no
`MCP-Protocol-Version` header. Request/response bodies were not captured, so
the exact initialization negotiation remains unknown.

ChatGPT Settings → the test app's connected account → Disconnect triggered
`POST /auth/oauth2/revoke` 200 at 14:22:51 UTC. The UI removed the connected
account and showed Connect. Aggregate D1 state showed all six refresh records
revoked (five previously rotated). The connected app tool became unavailable
immediately. Existing access records did not acquire their own revoked
timestamp; denial through their revoked refresh grant is covered locally, not
by a live attempt with a retained raw bearer token. No raw token was retained
for that purpose.

Reconnecting the saved app issued a new token at 14:24:22 UTC. ChatGPT Settings
again showed the connected account, and a third new chat tool activity returned
the expected synthetic JSON. The bounded tail observed the successful MCP POST
at 14:25:27 UTC. Reconnection after an actual client-initiated revocation is
therefore verified for immediate use. No new app or wider scope was created.

A later idle check found that this reconnected grant did not survive its
five-minute access-token lifetime. Safe D1 metadata showed the new access record
had only `mcp:read` and no linked refresh token; its expiry was 14:29:23 UTC.
The previous consent still included `offline_access`, but a consent record alone
does not make a narrower token grant renewable. This was not a rotation race.
The challenge and tool declaration had requested only the read scope during
reauthorization. Both now explicitly request `mcp:read offline_access`, and the
portable package makes both base scopes mandatory. Local regression coverage
reproduces an access-only grant, derives the next scope request from the server
challenge, reauthorizes the same client, and successfully refreshes the new
grant. Live reverification of the corrected reconnection is recorded below.

Reauthorizing the old saved client after the fix still produced a read-only
access grant without a refresh token at 14:58:48 UTC. The original native client
configuration/tool catalog retained narrower required scopes. A replacement
private native custom-MCP client was therefore created with **both** scopes as
mandatory base scopes (and both as defaults), with the same HTTPS resource and
OAuth/DCR. Creation succeeded in OAuth mode and reached the owner account-link
dialog. Mixed-auth creation had failed with a server-access error; no cause is
inferred. The owner then completed linking and consent personally.

### Corrected renewable reconnection — 2026-10-18

The replacement used source `15e9624` on the same isolated Worker, with both
`mcp:read` and `offline_access` required in the native client's base scopes.
Safe D1 metadata showed both scopes and a linked refresh token at 15:56:01 UTC.
The connected app tool returned the exact synthetic JSON at 15:57:11 UTC.

Disconnecting this replacement in ChatGPT removed the account and revoked all
active refresh records at 16:02:51 UTC. The owner then reconnected the same
saved replacement client. New grants at 16:04:41/43 UTC retained **both scopes
and refresh access**, with the last access expiry at 16:09:43 UTC. No wider
scope, token-reuse grace period or custom rotation implementation was added.

A fresh ChatGPT tool request after that expiry issued a replacement token at
16:10:17 UTC, again with both scopes and refresh access. A further bounded tail
observed `POST /auth/oauth2/token` 200 at 16:11:55 UTC followed by an authenticated
JSON `POST /mcp` 200 at 16:11:56 UTC. The UI displayed a completed synthetic-status
activity. This verifies renewable reconnection through access expiry, resolving
the original loss of offline access.

The replacement's ChatGPT conversation nevertheless displayed **"This response
could not be loaded"** for the final assistant answer, persisting after reload
and three fresh tool requests. An additional direct Codex connected-app call
after reconnection returned `Unknown tool`; the earlier direct call had worked.
These are unresolved client/bridge limitations, not evidence of failed OAuth:
the remote grant refreshed and the authenticated MCP POST returned 200. No
response body, private headers or browser credentials were captured to infer a
more specific cause. Full G01 remains open; do not claim the replacement's
final displayed JSON or the post-reconnection Codex bridge was verified.

### Protocol diagnostics and metadata-refresh limitation

An opt-in, default-off operator diagnostic was added to observe only SDK
requested/negotiated protocol versions, plus fixed anonymous-method labels and
RPC-framing validity. Unknown input becomes `other`; no body, ID, client metadata
or credential is logged. A direct operator control request on the hosted Worker
successfully negotiated `2025-11-25` and listed the one fixed tool. That is an
operator check, not an observed ChatGPT initialization.

ChatGPT's **Reload tools** action failed in this personal account. Bounded
observations showed a POST without authorization, protocol-version header,
query parameters, `application/json` content type or content encoding. This
JSON-RPC adapter recognized neither a method nor valid framing in the parsed
body. No request/response payload was
retained, so the exact preflight contents and the client-side cause are unknown.
The initial server returned 401; malformed protocol framing now returns a
bounded JSON-RPC 400 error. Reload still showed an error after this change.
Do not describe this maintenance action as verified or infer a new protocol era
from this failure.

For mixed-auth clients, only fixed `initialize`, `notifications/initialized`
and `tools/list` schemas may be discovered anonymously. Every batch member must
qualify. Tool calls, resources and unknown methods require the same OAuth owner,
scope and resource verification, and bad supplied credentials never fall back.
This implements the public metadata boundary documented in
[OpenAI's custom MCP guide](https://developers.openai.com/api/docs/guides/custom-mcp-server).
It did not resolve the separate unrecognized reload preflight. No root product
endpoint or financial operation was enabled. Temporary diagnostics were then
disabled in the hosted configuration; stored observability remains off.

The exact protocol revision selected on the live wire was not captured. The
SDK's locally tested revisions remain `2025-11-25` and `2025-06-18`; no
`2026-07-28` support is inferred. The administrative reload failure and exact
live protocol revision require further evidence. G01 remains open for those
limits; the successful synthetic path is not production client acceptance.

The separate [G04 Fortnox probe](S00-fortnox-evidence.md) passed live service
consent/client credentials and ordinary-user refresh rotation for one isolated
test company with `companyinformation profile`. It does not enable Fortnox in
this hosted MCP server or establish broader provider acceptance.

G02 embedded review, G03 multi-file transfer, G05 authorized source
redistribution and G09 representative budgets remain open.
G12 production owner bootstrap, lifecycle hardening and confidential report
submission remain unverified. S00 and S01 are not fully accepted by this slice.
