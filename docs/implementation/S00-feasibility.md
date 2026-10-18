# S00 — Establish integration feasibility

Status: **offline transport spike verified** on 2026-10-18; full S00 acceptance remains in progress. Dependencies: none. Do not build the full product before testing the uncertain boundaries.

The [local spike](../../spikes/s00-mcp/README.md) implements a synthetic read-only tool, strict schemas and offline Streamable HTTP tests. It intentionally has no remote authentication, UI, files, Fortnox connection or storage. See [actual results and unresolved gates](S00-spike-evidence.md). The deliverables below still apply to the full scope.

The separate [OAuth probe](../../spikes/s00-oauth/README.md) adds maintained OAuth,
owner-bound synthetic MCP access and local Node/workerd/D1 verification.
[Its evidence](S00-oauth-evidence.md) records successful live ChatGPT consent,
a synthetic tool call and refresh rotation, with broader client acceptance open.

The [Fortnox G04 operator probe](S00-fortnox-evidence.md) passed live for one
isolated sandbox and two identity scopes: service consent/client credentials,
user refresh rotation, tenant checks and `/me` semantics. Five offline checks
cover its local boundaries. This does not enable the root provider module.

The optional [G02 review experiment](S00-review-evidence.md) provides a synthetic
MCP Apps view and one-time, owner/company/proposal-bound approval in SQLite/D1.
It is default-off; local boundary tests are not live ChatGPT review acceptance.

[G05 source redistribution](S00-source-evidence.md) is precisely blocked pending
the supplied snapshot's acquisition record and applicable redistribution rights.
No provider specification is vendored or used for generation in these probes.

Reverification against merged `main` (`f14cd27`) passed strict typechecking, all 61 behavior tests, the build and both built-artifact tests. This verifies the code present in the spike, not the unimplemented live deliverables. See the [S01 handoff and verification record](S01-evidence.md).

## Deliver

- A minimal authenticated remote MCP server using the official TypeScript SDK, tested in the intended ChatGPT account/workspace.
- A synthetic embedded review view with a UI-only commit action and server-bound immutable proposal. Probe forged/replayed/model-origin calls and record what is guaranteed by the server versus the trusted host.
- A two-file receipt-input and file-output probe with synthetic files.
- Fortnox test-company activation evidence for service consent/client credentials and the fallback user refresh path; verify company and `/me` identity semantics.
- A small Worker/Node benchmark for representative schema catalog, decimals, file transfer and SIE parsing; assess durable atomic storage.
- Selected auth component, SDK/protocol versions, runtime/storage candidates and a source-license plan.

## Acceptance

Close or precisely block G01–G05/G09 as applicable in [verification gates](../reference/verification-gates.md). Document exact account/client/environment prerequisites and results. Do not interpret hidden tool visibility as sufficient human proof. No real bookkeeping mutations are needed for the synthetic UI probe.

If embedded review cannot meet the approved boundary, retain the default review policy with execution disabled and request a product decision. Do not introduce an external approval page as an unapproved workaround.

## Handoff

Commit evidence, the minimal reusable spike where appropriate and recommended pinned versions. Mark experimental code clearly; S01 determines what becomes supported production structure.
