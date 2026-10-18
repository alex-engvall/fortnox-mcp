# S05 — Sales and purchase workflows

Status: not started. Depends on S04.

## Deliver

Practical offer/order/customer-invoice and supplier-invoice flows: retrieval, preparation, creation, explicit update, sending, bookkeeping, cancellation/credit and supported payment registration. Split operations by side effect and gate them by actual scope/license/record state.

Model updates as reviewed resulting content/diffs, preserving intended rows under Fortnox's replacement semantics. Treat sending/printing/reminders according to verified effects, not GET/PUT labels. Standard client approvals apply; manual-voucher creation via any route still enters the manual-voucher policy.

## Acceptance

End-to-end synthetic document lifecycle, mixed VAT/precision examples validated against provider constraints, row omission/update tests, cancellation/credit state errors and timeout/reconciliation tests. External delivery goes only to explicitly authorized test recipients. Payment registration is never described as sending money through a bank.

Verify all advertised operations individually; do not enable a resource's full method set merely because creation passed.

## Handoff

Record provider IDs/state transitions and synthetic fixtures needed for analysis. Document specialized finance/recurring functions still assigned to S13.
