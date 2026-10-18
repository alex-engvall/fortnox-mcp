# Product scope

## Purpose

Make Fortnox accessible through reliable MCP tools that business owners, accounting firms and developers can run themselves. Users should work in their AI client, use several companies, understand the evidence behind analyses and retain control of financial actions.

The project is independent of Kollino and Fortnox. Its own distribution is free of charge and licensed AGPL-3.0-only. Paid third-party hosting and distribution remain permitted under the license.

## Initial users and boundaries

One authenticated owner per installation, with multiple explicitly connected Fortnox companies. Accounting firms can use this model for one employee working across clients. Team accounts, delegated employee roles and a project-operated hosted service are future extensions, not initial features.

ChatGPT is the initial acceptance client. Claude is next; retain standard MCP behavior for other compatible clients. Daily tasks, receipt review and manual-voucher approval should stay in the client. Initial deployment, provider sign-in and owner administration may require a browser.

## Stable-release breadth

Stable 1.0 must support practical end-to-end work across bookkeeping, customer invoicing, supplier invoices, customers/suppliers/articles, offers/orders, receipt attachments and useful payroll-input examples. Financial analysis must reach account balances and transactions, not just invoice totals.

The full API inventory remains visible, including assets, warehouse, recurring billing and time reporting. These have explicit extension scopes. Completion of every specialized endpoint is not implied by 1.0, but common workflows must not be replaced by a small read-only demo. The [release coverage table](releases.md) is the initial measurable definition of breadth; changing that threshold requires a product decision.

Capabilities are conditional on upstream endpoint availability, granted scopes, applicable user rights and Fortnox product licenses. Surface those limits explicitly rather than hiding unsupported actions or manufacturing results.

## User outcomes

| Outcome | Observable success |
| --- | --- |
| Work across companies | A user lists connections, chooses a company, and cannot accidentally reuse another company's object IDs or approval. |
| Invoice work | A supported document can be prepared, reviewed, created and sent through distinct tools with distinct effects. |
| Receipt batch | Several receipts produce separate reviewable proposals and independent success/failure records. |
| Manual bookkeeping | Unbalanced vouchers are rejected; review mode requires the approved interaction and cannot silently downgrade. |
| Flexible analysis | The client can inspect every available account, its movements and evidence for period/company comparisons. |
| Payroll input | Synthetic attendance/absence or salary input is validated and sent through verified supported APIs. No payroll-run or bank-payment claim. |
| Developer help | A developer finds an operation, its official source, prerequisites, limitations and safe diagnostic information. |

## Not included initially

No built-in LLM/OCR service, local Fortnox simulator, payroll calculation engine, payroll payout initiation, autonomous scheduler or permanent replica of the ledger. Tests may use mocked HTTP and synthetic fixtures; that is not a user-facing simulator. Scheduling can be handled by external agents within the same policies.

## Release approach

Public development and clearly labeled prereleases. Each prerelease states implemented modules, tested clients, risks and missing gates. Stable 1.0 requires [release gates](releases.md), not simply a date or operation count.
