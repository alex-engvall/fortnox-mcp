# Implementation queue

S00 is **in progress**, with an isolated synthetic transport spike and [offline evidence](S00-spike-evidence.md). Its live acceptance gates remain open. S01–S13 are **not started**. Read [AGENTS.md](../../AGENTS.md), [decisions](../decisions.md) and relevant contracts before beginning a scope.

| Scope | Deliverable | Dependencies |
| --- | --- | --- |
| [S00](S00-feasibility.md) | Client/auth/review/files/runtime evidence and selected versions | None |
| [S01](S01-foundation.md) | Executable workspace, tests, CI and runtime skeletons | S00 outcomes for selected mechanisms |
| [S02](S02-connections.md) | Owner identity, provider consent and multiple companies | S01, G01/G04 |
| [S03](S03-provider-mcp.md) | Provider client, policies, tool contracts and discovery | S02 |
| [S04](S04-registers.md) | Common registers and reference data | S03 |
| [S05](S05-documents.md) | Sales/purchase document workflows | S04 |
| [S06](S06-accounting-review.md) | Bookkeeping validation and embedded manual review | S04, G02 |
| [S07](S07-receipts.md) | Multi-receipt/file workflows and recovery | S06, G03 |
| [S08](S08-analytics.md) | Full financial data basis and traceable calculations | S04, S05/S06 read contracts, G07 |
| [S09](S09-payroll.md) | Verified payroll-input example and extensible module | S04 |
| [S10](S10-developer-tools.md) | Documentation discovery and safe diagnostics | S03, G05 |
| [S11](S11-setup-deployment.md) | User wizard, packaging, operations and bilingual guides | S02/S03; final acceptance after S06/S07 |
| [S12](S12-release.md) | Common-workflow acceptance and release process | S04–S11 and applicable gates |
| [S13](S13-expansion.md) | Explicit future modules | Stable core and per-module evidence |

## Scope handoff

Each implementation PR states the scope, accepted criteria, changed contracts, tests actually run and unresolved gates. Update status only with evidence. Product decisions need no repeated approval when the implementation follows them; raise only real ambiguities or necessary changes.

A scope can be split into smaller PRs, but dependencies and final acceptance remain visible. Do not merge unfinished cross-company isolation or approval logic behind an advertised production capability. Early prereleases may expose verified subsets.

## Coding-agent task template

“Implement scope Sxx in this repository. Read AGENTS.md, the decision register and the scope's contracts first. Inspect current implementation and existing work. Preserve accepted product behavior. Implement a reviewable slice with meaningful tests, update coverage/docs and report exact verification. Do not publish, merge or use production data unless separately authorized. If a verification gate fails, document the evidence and keep the affected capability disabled rather than weakening the contract.”

No multi-agent orchestration, model choice or paid service is required by the project. Contributors may use their preferred development tools while meeting the same acceptance criteria.
