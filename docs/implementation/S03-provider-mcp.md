# S03 — Provider client and MCP contracts

Status: not started. Depends on S02.

## Deliver

Implement [tool contracts](../contracts/tools.md): central company/policy enforcement, request/response envelopes, structured errors, capability/module catalog and bounded continuations. Build a Fortnox HTTP adapter with safe origin handling, tenant rate limiting, reviewed pagination/parameter overlays and redacted diagnostics.

Introduce write-intent records and recovery primitives without claiming universal idempotency. Create the per-operation coverage ledger using an authorized specification input and documented source/derivative permissions.

## Acceptance

Test 429/backoff, pagination across multiple pages, partial read budgets, provider errors, token reacquisition, mixed-company concurrency and malicious provider URLs. GET email/eprint are classified as writes. Missing `security` in OpenAPI never causes anonymous provider requests.

All entry points share policy; no arbitrary URL/method/body execution tool exists. Validate structured outputs and annotations with MCP Inspector and the first client.

## Handoff

Publish actual operation-ledger schema, extension registration instructions and evidence for G06/G08 foundations. Modules not implemented remain explicitly unavailable.
