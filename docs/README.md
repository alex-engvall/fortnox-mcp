# Documentation map

Baseline approved by the project owner on **2026-10-18**. This is an implementation specification, not a record of implemented features.

## Reading paths

| Audience/task | Reading order |
| --- | --- |
| Product/review | [Product](product.md) → [decisions](decisions.md) → [release gates](releases.md) |
| First contributor | [English developer README](../README.en.md) → [CONTRIBUTING](../CONTRIBUTING.md) → [development](development.md) → [architecture](architecture.md) → [implementation queue](implementation/README.md) |
| API integration | [Sources](reference/sources.md) → [coverage](reference/coverage.md) → [authentication](contracts/authentication.md) → [tools](contracts/tools.md) |
| Financial correctness | [Validation](contracts/validation.md) → [analytics](contracts/analytics.md) → [tests](testing.md) |
| User workflows | [Approval](contracts/approval.md) → [receipts](contracts/receipts.md) → [client compatibility](contracts/clients.md) |
| Project website | [Website source](../index.html) → [development and publishing](website.md) |
| Operations | [Security](security.md) → [storage](contracts/storage.md) → [deployment](deployment.md) |
| Swedish user | [Project introduction](../README.md) → [Kom igång](users/kom-igang.sv.md) → [examples](users/exempel.sv.md) |

## Authority and maintenance

Approved decisions take precedence over illustrative examples. Contracts define required behavior. Implementation scopes identify dependencies and acceptance criteria; they do not weaken the contracts. Source facts are distinguished from project choices and unverified assumptions in [verification gates](reference/verification-gates.md).

Coverage means verified behavior, not merely a generated tool definition. All modules are currently **planned, not implemented**. Update affected documents together when a decision changes. Keep one current decision register rather than accumulating contradictory planning documents.

The isolated [S00 spike](../spikes/s00-mcp/README.md) now contains a pinned SDK, lockfile, executable synthetic server and offline tests. It is not a production module or Fortnox implementation. There is no application CI pipeline or deployed MCP environment. See the [evidence and unresolved gates](implementation/S00-spike-evidence.md).
