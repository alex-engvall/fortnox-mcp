# S00 embedded review experiment (G02)

Status on 2026-10-18: **local server boundary verified; live ChatGPT review
acceptance pending**. This default-off addition to the isolated OAuth probe
records synthetic test approvals only. It has no Fortnox connection and cannot
execute a financial operation. The root product remains disabled.

## Mechanism

The model-callable `prepare_synthetic_review` returns one fixed synthetic
proposal with company identity, fiscal year/date/series, description, rows,
debit/credit totals, difference, currency, receipt reference and warnings. It
also returns the immutable proposal ID/hash and ten-minute expiry. A random
256-bit one-time capability is delivered only in result `_meta`; it never
appears in model-visible text or `structuredContent`.

The `ui://s00/review-v1.html` resource uses standard MCP Apps metadata and MIME
type `text/html;profile=mcp-app`. Its dependency-free vanilla view uses the
standard JSON-RPC `postMessage` bridge, initializes UI protocol `2026-01-26`,
receives tool results and calls `commit_synthetic_review` only after its visible
button is clicked. It requests no external assets or network domains. Swedish
and English labels, keyboard controls, readable proposal fields and an explicit
expiry/error state are provided. No external approval page is substituted.

The commit tool is app-only through `_meta.ui.visibility: ["app"]`. Its strict
input accepts only the proposal reference/hash, exact expiry and capability;
replacement rows, `confirmed=true` and `origin=ui` are not accepted. SQLite or
D1 atomically changes the prepared row to consumed only when authenticated
owner, fixed synthetic company, canonical hash, policy version, capability
digest and unexpired timestamp all match. A duplicate/concurrent request cannot
consume it twice. No provider call follows consumption. A lost database response
returns an unknown-outcome error and the view does not retry.

Both prepare and commit require the separately granted `mcp:review` scope in
addition to the normal owner/resource/read authorization. Existing read-only
grants cannot obtain a capability. The catalog/resource/extra scope are absent
unless the operator explicitly enables the review experiment. The policy is
fixed to review-required version 1; no model-callable policy editor exists.
Per-owner unexpired rows are bounded at 32, and expired synthetic metadata is
removed on preparation. This is not production proposal retention or encryption.

## Trust boundary

A conforming trusted host must keep `_meta` out of model context, hide app-only
tools from the model and deliver the capability only to the intended embedded
view. The server enforces proposal/owner/company/policy/expiry/one-time binding.
It **cannot prove a physical human click against a malicious host** holding the
same OAuth grant and UI capability. An unsigned UI-origin claim is not used as
authorization. These assumptions follow the [approval contract](../contracts/approval.md).

The host boundary still needs a real ChatGPT rendering/click/hidden-tool test.
Local tests cannot establish that boundary. Until then G02 remains open and
review-required product execution remains disabled.

## Observed checks

Local Node 24.19.0/SQLite and actual workerd/D1 tests cover wrong owner,
changed hash/expiry, forged capability, replacement rows,
expired/replayed approvals and concurrent consumption. MCP tests verify app-only
metadata and exclusion of the capability from model-visible results. Actual
OAuth requests on Node and workerd deny a read-only grant, allow a separately
consented review grant, and reject a replay across fresh HTTP handlers.
SQLite checks additionally reject changed company/policy version and enforce
the per-owner outstanding-record bound.

In Chrome on Windows, a temporary loopback-only host harness exercised the
actual widget in a sandboxed iframe: prepare → labeled company/details and
balanced row table → click → one recorded synthetic approval with the button
disabled. Changing language updated the labels and retained the completed state.
Opening the resource without a parent host displayed the unsupported-client
message with approval disabled. No error/warning console entries were observed;
the page was nonblank with no framework overlay. Screenshots and the harness
remain outside tracked source. This was a desktop viewport only, using CUA in
the user's selected Chrome; it is **not** a ChatGPT rendering/visibility test.

The package's 21 tests, strict typecheck, Biome and Worker build passed locally.
Hosted checks also passed on source `918210d`:
[S00 OAuth](https://github.com/alex-engvall/fortnox-mcp/actions/runs/39144567943),
[S00](https://github.com/alex-engvall/fortnox-mcp/actions/runs/39144567941), and
[S01](https://github.com/alex-engvall/fortnox-mcp/actions/runs/39144567962).

That source deployed successfully to the existing isolated test Worker after
applying only the synthetic-review table. The operator explicitly enabled the
review flag there; public metadata advertised the three scopes and the expected
three-tool catalog, with app-only commit visibility. A separate private native
ChatGPT client was created with all three mandatory base/default scopes. The
owner completed consent personally. The first issued tokens nevertheless
omitted `mcp:review`: the provider's default insert-only resource seed retained
the old two-scope database row. Safe metadata queries confirmed the client and
consent had all three scopes but the stored resource allowlist did not.

The probe now selects the maintained provider's `resourceSeedMode: "merge"`.
This updates only configured resource-policy fields; this isolated probe has
no resource-policy administration API and its explicit configuration owns the
allowlist. A regression starts with the earlier two-scope resource in Node and
D1, then verifies review opt-in, separately consented issuance and callback
authorization. Existing issued tokens are not broadened; a fresh authorization
is required. Actual embedded ChatGPT acceptance remains pending.

These use SDK 1.32.1 and the existing maintained OAuth provider. No SDK upgrade,
new dependency or live-host claim follows. The UI bridge is adapted narrowly
from the [official vanilla MCP Apps quickstart](https://developers.openai.com/plugins/build/app-quickstart),
using the [MCP Apps trust model](https://modelcontextprotocol.io/extensions/apps/overview).
Current ext-apps 2.x peers require SDK 2.x; helpers are not required for the
standard metadata/bridge used by this pinned SDK experiment.

## Explicit operator enablement

Run `node --import tsx scripts/prepare-review.ts`. Apply its ignored
`.data/review.sql` to the **same isolated probe D1**, then add
`PROBE_SYNTHETIC_REVIEW: "true"` to the private Wrangler vars and deploy the
probe. Never apply this to the root app database. The public example leaves
the experiment off. Local Node can set `reviewEnabled: true` in its ignored
config; it initializes the synthetic table in that local database.

A live review client must explicitly request `mcp:read offline_access mcp:review`
and the owner must complete its consent personally. Existing grants are not
silently broadened. Disabling the flag removes the tools/resource and stops
advertising the extra scope; no grant should be considered product acceptance.
