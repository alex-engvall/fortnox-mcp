# Release policy and stable 1.0 gates

The repository is public throughout development. Use semantic versioning and explicit prerelease tags, for example `0.1.0-alpha.1` or `1.0.0-rc.1`. These are examples, not existing releases. A normal `1.0.0` release follows verified breadth and stability.

## Stable coverage baseline

This makes the approved goal of broad common-program support reviewable. Detailed operation status lives in the coverage inventory and implementation evidence.

| Area | Required for stable 1.0 |
| --- | --- |
| Connections | Owner setup, multiple companies, revocation/reconnect, explicit company isolation, read-only/manual-review policy |
| Registers | Read and supported common maintenance for customers, suppliers, articles and required reference data |
| Sales | Practical offer/order/customer-invoice lifecycle, distinct create/update/send/bookkeep/credit/cancel operations where supported |
| Purchases | Supplier-invoice lifecycle, supported payment registrations and document links; no claim of bank transfer initiation |
| Accounting | Accounts/years/series/locked period, read vouchers, validated manual vouchers with embedded review, supporting references |
| Receipts | Multiple files, review, upload/link, retrieval, independent item outcomes and safe recovery |
| Analysis | All-account balance and transaction basis, result/balance categories, receivable/payable and liquidity basis, period/company comparison and drill-down |
| Payroll | At least one useful verified payroll-input flow plus documented scope limits; no full payroll engine |
| Developer help | Official-source documentation discovery, operation explanation and redacted diagnostics |
| Delivery | Tested ChatGPT flow; Node/Docker and Worker behavior proven or a documented product decision revises supported deployment claims |

Claude is the next acceptance priority, not a reason to claim untested support. Warehouse, assets, advanced recurring/time functionality and specialist finance/bank/partner APIs have explicit expansion scopes. Their absence is disclosed and is not hidden behind a global "full Fortnox support" claim.

## Mandatory quality gates

1. No unresolved release-blocking gate in [verification gates](reference/verification-gates.md) for advertised capabilities.
2. Required coverage is implemented and verified, with regression evidence from [testing](testing.md).
3. Review-mode behavior and host trust assumptions are documented and tested in the supported ChatGPT setup.
4. Unknown financial-write recovery, cross-company isolation and exact-money validation pass.
5. Tested onboarding, secret handling, upgrade/backup/restore and data cleanup.
6. User documentation accurately distinguishes implemented, partial and unavailable features in English/Swedish.
7. Private security-reporting channel works; dependency/license provenance, SBOM and AGPL source availability are checked.
8. Release notes name actual versions, compatibility, limits and breaking changes. No production-ready claim based only on mocked tests.

## Prerelease rules

Installable prereleases can expose a subset but must state exactly what works and which gates remain. Do not expose an unsafe write just because a build is labeled alpha. Disabled review execution stays disabled until its gate passes. Test-account usage is the default recommendation until the release has explicit production-readiness evidence.

## Release execution

The maintainer reviews evidence and authorizes publishing. CI builds immutable versioned artifacts from a tagged commit; checksums, source links and dependency/license records accompany releases. Do not publish credentials, external specifications without permission, or private fixtures. Release workflow implementation belongs to S12, not this documentation PR.
