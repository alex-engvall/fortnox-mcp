# Approved decision register

Approved baseline: 2026-10-18. Product owner: alex-engvall. Details below consolidate the conversation, including superseded approval proposals. No separate external approval page is mandated for daily bookkeeping.

| ID | Decision | Consequence |
| --- | --- | --- |
| D01 | Independent, community-oriented Fortnox MCP project | No Kollino dependencies, branding or tenant assumptions. |
| D02 | Public repository, own distribution free, AGPL v3 | Use SPDX AGPL-3.0-only as the explicit version selection. No resale approval requirement; no CLA/copyright assignment initially. |
| D03 | Self-hosting first; no central project service at launch | Each installation has its own Fortnox Client ID/Secret. Never distribute a shared secret. |
| D04 | TypeScript; portable core | Cloudflare evaluated first for simple deployment; Node.js/Docker alternative. |
| D05 | Setup wizard plus developer configuration | Browser setup for owner identity, companies, status and client instructions. |
| D06 | One owner, multiple companies in v1 | Company isolation from the first executable slice; future team roles must not require rewriting domain isolation. |
| D07 | Broad read/write use, not just search | Common Fortnox workflows form the stable-release baseline. Restricted APIs are classified separately. |
| D08 | Analysis in the AI client | Server retrieves data and performs deterministic calculations with evidence; no required model API key. |
| D09 | Full financial data basis | All available accounts/balances, assets, liabilities, equity, income, expenses and transactions; liquidity and cross-period/company comparisons. |
| D10 | Standard client approvals for normal tools | Accurate MCP annotations; server still enforces ownership, scope and validation. Optional read-only mode is server-enforced. |
| D11 | Manual vouchers default to embedded review | Per-company `review_required` or `client_managed`; owner can change it outside model tools. All manual-voucher paths obey the same policy. |
| D12 | Keep daily work in the AI client | Prefer MCP Apps review UI; compatibility and trusted approval verification are S00 gates. Unsupported review mode blocks execution rather than downgrading. |
| D13 | Accounting validation is mandatory | Exact decimals, balanced vouchers, resource checks, safe retry handling and meaningful automated tests. Approval never bypasses validation. |
| D14 | Multiple receipts in one workflow | Per-item proposals, review, evidence, status, partial failure and reconciliation. |
| D15 | Fortnox is the system of record | Minimal bounded operational state, temporary files and no full local financial replica. |
| D16 | Payroll input first | Expand later; no initial full payroll run, payslip-generation or payout promise. |
| D17 | Developer assistance included | Documentation search, operation discovery and redacted diagnostics. No local simulator initially. |
| D18 | ChatGPT first; Claude next | General MCP core with capability-specific adapters and a tested client matrix. |
| D19 | Swedish default README; English developer material | The public website (`index.html`) and default `README.md` introduce the project in Swedish for business owners across industries. Both link to `README.en.md` for developers. The website uses static GitHub Pages hosting; the MCP server uses its own runtime. Swedish and English discussions are welcome; code and technical reference docs use English. Swedish setup guidance and examples remain available. |
| D20 | Public prereleases before stable 1.0 | Stable release requires useful breadth plus quality and compatibility evidence. |
| D21 | Fortnox test environment available through owner | Owner has developer access and can create a test company; no credentials have been supplied or live tests run for this baseline. |

## Implementation choices versus unresolved evidence

D19 was refined and clarified by the owner on 2026-10-18: make Swedish the default README, address business owners across industries and link to an English developer README in the introduction. The owner corrected the earlier sector-specific wording; the presentation follows the project's broad audience and D01 independence. `README.sv.md` remains as a compatibility link. Effective immediately for documentation; no runtime or data migration is required.

D19 was extended by the owner on 2026-10-18 to include a dedicated Swedish open-source project website on GitHub Pages, with a shorter repository README. The owner requested more colour and style inspiration from Almega, Svenskt Näringsliv and Företagarna. This is a presentation and static-hosting choice; it does not change MCP hosting or the implementation scope.

D19 presentation refinement, approved by the owner on 2026-10-18: replace the illustrative hero with a direct, typography-led introduction to the planned ChatGPT–Fortnox connection, emphasize free software and open source, and align the header background with the hero. Remove the Claude logo and public-page presentation because no required brand approval is recorded. This does not change D18's future client roadmap, the development status or external provider/hosting costs.

Retention defaults, package boundaries and tool names in the contracts are initial engineering choices that may be refined with documented rationale. They must preserve these decisions. Unknown provider/client behavior is not resolved by optimistic wording: see [verification gates](reference/verification-gates.md).

## Superseded proposals

- Mandatory external browser approval for every manual voucher: replaced by embedded client review and an owner-configurable policy.
- A bespoke broad preapproval/automation-permission engine: not part of v1; normal actions use the client's controls.
- A single user with a single company: rejected; multiple companies are foundational.
- A general ban on commercial use/resale: not adopted; AGPL is the selected open-source license.

Future changes must record the changed ID, reason, effective release, migration impact and owner approval. Do not leave conflicting current rules in a new document.
