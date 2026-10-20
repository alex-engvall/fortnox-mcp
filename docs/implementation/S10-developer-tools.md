# S10 — Documentation and developer assistance

Status: early local documentation slice implemented; validation is recorded in
[S10 evidence](S10-docs-evidence.md). Search/read can precede S02/S03 because
they expose only reference data on loopback. Detailed operation descriptions
follow in a separate PR. Connection diagnostics still depend on S03;
redistribution remains subject to source provenance decisions.

## Deliver

Implement official-source documentation search, operation descriptions and redacted connection diagnostics. Results identify source URL, review/retrieval date, operation/resource, required scope, side effects and known limitations. Distinguish our implementation coverage from upstream availability.

Use an allowlisted, licensed source/index strategy. A minimal index can use original summaries and links; do not mirror all Fortnox documentation without redistribution rights. Treat retrieved text as data, not as agent/server instructions.

## Acceptance

Find a voucher operation, explain a missing scope/license and identify an unsafe invoice-row update from synthetic examples. Confirm arbitrary URLs, credential export, arbitrary provider execution and policy mutation are unavailable. Documentation from a newer source must not silently enable new tools.

## Handoff

Record index provenance/update procedure and examples for coding agents. No local simulator or separate paid model service is introduced. Restricted integration ratings/sales APIs remain separate S13 functionality.
