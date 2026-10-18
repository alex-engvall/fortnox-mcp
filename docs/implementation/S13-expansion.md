# S13 — Explicit expansion modules

Status: future work. Depends on stable shared policy, validation and provider contracts.

## Candidate modules

| Module | Work before enabling |
| --- | --- |
| Assets | Asset/type lifecycle, depreciation/booking effects, file links and permissions |
| Warehouse | Purchase/production orders, stock movements, inventory and custom documents; classify every financial/stock side effect |
| Recurring billing | Agreements/schedules, invoice requests, deviations and duplicate prevention |
| Time reporting | Distinguish time-reporting APIs from payroll attendance and map rights correctly |
| Advanced payroll | Verify actual available APIs before promising runs, payslips or payouts |
| Fortnox Finance | Financial consequences, required agreements and irreversible actions |
| Bank/company-order APIs | Specialist/bank credentials and eligibility; no general OAuth-access assumption |
| Integration developer | Partner-only prerequisites for ratings, sales and user APIs |
| Events | Consent/websocket verification, minimal events, replay and rate-budget impact |
| Teams/shared hosting | New identity, role and cross-user isolation design; cannot reuse single-owner assumptions |

## Acceptance pattern

Create a dedicated scoped proposal per module with user outcomes, official sources, access requirements, operation ledger, validation, approval/retry behavior and evidence. Reuse the core contracts; never bypass them for specialized APIs.

No simulator, central hosting or broader payroll processing is implicitly scheduled by this list. The list preserves a clear development path without presenting those capabilities as implemented.
