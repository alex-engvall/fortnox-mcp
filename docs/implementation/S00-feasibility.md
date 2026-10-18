# S00 — Establish integration feasibility

Status: not started. Dependencies: none. This is the first implementation task; do not build the full product before testing the uncertain boundaries.

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
