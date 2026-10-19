# S00 client maintenance and review recovery (G01/G02)

Recorded **2026-10-18**, local follow-up to PR #11 base `58aa8f7`.
**Implementation and local regression checks are complete; hosted ChatGPT
acceptance remains open.** This record does not supersede the earlier live
results with an unperformed deployment or client run.

## Implemented behavior

The isolated OAuth probe retains SDK 2.3.1 and the shared owner/resource/scope
boundary for modern and legacy requests. Its opt-in Worker diagnostic now
records one allowlisted request summary on either transport: HTTP method and
content-type categories, observed protocol header, fixed RPC method labels,
authorization category, chosen transport and response status. Unknown values
become `other`. Protocol headers are observations, not proof of negotiation or
successful administrative reload. Raw headers, payloads, IDs, URLs, tool names,
arguments and credentials are excluded.

The diagnostic requires both `PROBE_PROTOCOL_DIAGNOSTICS=true` and a valid UTC
`PROBE_PROTOCOL_DIAGNOSTICS_UNTIL` deadline within the next 15 minutes. It stops
at the deadline or after 64 events per Worker isolate. This is not a global
64-event limit across isolates. It remains off by default; stored observability
is not enabled. The existing internal legacy negotiation callback remains
available for local interoperability tests.

The new app-only, read-only `read_synthetic_review_status` requires the normal
OAuth owner/resource checks and separately consented `mcp:review`. Its strict
input is the original proposal ID, hash and exact expiry. SQLite and D1 read
only the matching owner/company/hash/policy-version/expiry record. Responses
contain only `prepared`, `consumed`, `expired` or `unavailable` and the fixed
`fortnoxEnabled: false`. They contain no capability, grant or new proposal.
Consumed state takes precedence over expiry while the record exists. Existing
expiry cleanup can remove old records; `unavailable` does **not** prove that an
earlier action failed, and no retention extension is claimed.

The view retains `ui://s00/review-v1.html`, the standard bridge and empty network
allowlists. It reads server status before enabling approval. A remounted
consumed result is read-only even without private `_meta`; a prepared result
without its original capability cannot approve. Each mounted view accepts one
immutable proposal result and ignores late/duplicate notifications. Capabilities
are never persisted by the view. Double clicks are suppressed locally and
concurrent views still share atomic server consumption.

After an error or the real 15-second bridge timeout, the view performs a status
read, never an automatic commit retry. Confirmed consumption displays success;
otherwise that mounted view stays in unknown-outcome state, including when a
status read fails or still reports prepared. **Check status** retries only the
read. Unsupported hosts, missing metadata, expired proposals and outages leave
approval disabled. These are synthetic approvals, not upstream financial writes.

## Local verification

Environment: Linux x64, Node 24.19.0, npm 11.9.0. The Browser skill was available,
but no associated Browser `js` runtime tool was callable in this session. The
planned standalone Playwright harness was therefore used with system Chromium
at `/usr/bin/chromium`, desktop Chrome and Pixel 7 viewport/device emulation.
Mobile emulation is not a real-device or another-browser-family claim.

The loopback-only harness uses the actual widget and domain service backed by
SQLite. Its iframe allows scripts without same-origin privileges; CSP allows
only the exact inline script/style hashes and denies all network connections.
It is test infrastructure, not a production host or OAuth implementation.

Verified scenarios cover rendering and keyboard activation, one approval,
duplicate notifications, two concurrent views, consumed remount without private
metadata, full host-page reload, a lost commit response with actual bridge
timeout, unresolved outcomes with failed reads, expired references, recovery
from status outage, server-confirmed consumption despite local clock expiry,
bilingual controls and standalone unsupported-host behavior.
Assertions check meaningful content, titles, console errors/warnings, disabled
controls, database-backed counters and horizontal overflow. Synthetic desktop
and mobile screenshots are saved outside the repository under `/tmp`.

Backend coverage includes scoped status denial, wrong owner/hash/expiry/company/
policy rejection, SQLite restart persistence, lost database responses, D1 reads,
cross-era replay, repeated catalog/resource reads, diagnostic privacy and the
diagnostic deadline/event bound. Browser checks run in the existing secret-free
OAuth CI workflow; no hosted run of this follow-up is claimed here.

| Command/check | Result |
| --- | --- |
| `npm run typecheck` | Passed, including browser tests and harness |
| `npm run lint` | Passed |
| `npm run build` | Passed; Worker bundle built |
| `npm test` | 25 passed, none skipped; Node/SQLite and actual local workerd/D1 |
| `PROBE_CHROMIUM_PATH=/usr/bin/chromium npm run test:browser` | 18 passed; nine scenarios on desktop and mobile-emulated Chromium |
| `npx --no-install wrangler deploy --dry-run --config wrangler.example.jsonc` | Passed without deployment credentials or resource changes |
| Markdown relative links / `git diff --check` | Passed |

At 17:50 UTC on 2026-10-18, the existing **S00 verifiering** connected app was
also called directly from this Codex chat. It returned
`{"dataset":"s00-oauth","authenticated":true,"fortnoxEnabled":false}`.
This is baseline availability of the existing hosted deployment, whose exact
source was not re-inspected. It does not exercise this local follow-up, saved
answer rendering, administrative reload, UI recovery or observed token refresh.

## Remaining actual-host acceptance

1. Deploy the verified source to the existing isolated synthetic Worker/D1,
   preserving owner, grants and the explicit review flag. No schema migration
   is needed for status reads. Use the corrected renewable client, not the older
   unauthorized comparison client. Record the exact deployed commit.
2. G01: create a synthetic status answer, reload the whole ChatGPT conversation,
   reopen the answer, run administrative **Reload tools**, then make another
   authenticated call. Observe visible reload success and actual request
   outcomes. If it fails, reproduce and attribute the fault before changing the
   protocol boundary. A 200 response alone does not close G01.
3. G02: test the real embedded view with restrictive custom-app CSP enabled,
   approve a synthetic proposal and verify one consumed D1 record. Remount the
   same completed view, attempt replay and verify that consumption does not
   increase. Exercise expiry, failed status retrieval and a second browser.
   Record desktop/mobile support only for environments actually exercised.
4. Confirm commit/status tools are absent from the model catalog and capabilities
   remain outside model context in the actual trusted host. Local metadata tests
   and model self-report cannot establish physical human presence.
5. Turn diagnostics off, remove the temporary deadline, stop tails and record
   results in the OAuth/review evidence and gate register. If host rendering
   still fails, retain the capability restriction and record the blocker.

This session had no paired browser control tool or configured Cloudflare
credentials for the isolated deployment. Apart from the direct baseline status
call, no actual-host maintenance/review retest, account-setting change, deployment,
Fortnox operation, merge or release was performed. G01 and G02 remain partially
verified pending the actual-host steps above.
