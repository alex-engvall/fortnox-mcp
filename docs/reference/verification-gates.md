# Verification gates and known gaps

These are engineering checks, not unmade product decisions. All begin **unverified**. Source reading alone does not close them. A failed gate disables the affected capability or requires an explicit product revision; it must not be hidden by a weaker fallback.

| Gate | Owner scope | Required evidence | Blocks |
| --- | --- | --- | --- |
| G01 Client protocol/auth | S00/S02 | Real ChatGPT connection, token/metadata/redirect behavior, required account/workspace plan and SDK/protocol versions | Initial client claim |
| G02 Embedded review boundary | S00/S06 | UI-only commit behavior, owner/proposal binding, forged/replayed calls, declared trusted-host assumptions | Review-required manual booking |
| G03 Multi-file transfer | S00/S07 | Two uploaded receipts, expiry, size/type limits and output file retrieval | Receipt-flow claim |
| G04 Service/user connection | S00/S02 | Service consent/client credentials and user refresh paths; verify tenant identity and `/me` semantics | Connection modes |
| G05 Source provenance | S00/S03 | Authorized spec acquisition, dependency/generated-output licensing strategy and source hash | Vendored/generated redistribution |
| G06 Provider differences | S03 | Reviewed overlays for missing security/global parameters, casing, envelopes and undocumented constraints | Affected operation |
| G07 Financial correctness | S06/S08 | Test-company year/lock/row/sign/precision semantics; SIE/account reconciliation | Bookkeeping/analysis |
| G08 Write recovery | S03/S06/S07 | Lost-response, concurrent submit and partial-link recovery; evidence for any upstream idempotency claim | Financial writes |
| G09 Runtime budgets | S00/S01/S11 | Cloudflare/Node memory, CPU, file and state benchmarks; atomic durable storage | Hosting/scale claim |
| G10 Payroll limits | S09 | Supported employee/absence/attendance/salary-input fields, rights and errors | Payroll-input claim |
| G11 Common workflow breadth | S12 | End-to-end evidence for each mandatory release area | Stable 1.0 |
| G12 Security/reporting | S01/S12 | Owner/bootstrap security and a tested confidential vulnerability-report channel | Installable prerelease |

## Source inconsistencies already observed

- 405 operations on 249 paths; only three operations declare security locally, and no global security requirement is declared. Most operations still require provider authorization.
- Mixed Fortnox `/3` resources and newer `/api` families with different access prerequisites.
- An empty API version string; identify the snapshot by checksum and acquisition date.
- Global parameters from the guide are not consistently modeled on each operation. Some fiscal-year/date parameter casing differs between source sections.
- Invoice update rows can be removed when omitted and row IDs can change; naive partial array updates are unsafe.
- GET email/eprint operations have side effects. Print/reminder endpoints require classification before enabling.
- Accounts expose opening/closing balances, not a documented arbitrary-date balance query. SIE provides a candidate full-ledger basis; API behavior still needs verification.
- `/3/me` contains `SysAdmin`; that does not by itself identify the human owner behind service credentials.

## Gate record format

For each gate, commit a concise evidence record with status, date, server commit, client/provider test environment, exact scenario, observed result, limitations and links to tests. Keep credentials and real data out. Closed gates are reopened when an upstream change invalidates the evidence.
