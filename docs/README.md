# Documentation map

Baseline approved by the project owner on **2026-10-18**. This is an implementation specification, not a record of implemented features.

## Reading paths

| Audience/task | Reading order |
| --- | --- |
| Product/review | [Product](product.md) → [decisions](decisions.md) → [release gates](releases.md) |
| First contributor | [CONTRIBUTING](../CONTRIBUTING.md) → [development](development.md) → [architecture](architecture.md) → [implementation queue](implementation/README.md) |
| API integration | [Sources](reference/sources.md) → [coverage](reference/coverage.md) → [authentication](contracts/authentication.md) → [tools](contracts/tools.md) |
| Financial correctness | [Validation](contracts/validation.md) → [analytics](contracts/analytics.md) → [tests](testing.md) |
| User workflows | [Approval](contracts/approval.md) → [receipts](contracts/receipts.md) → [client compatibility](contracts/clients.md) |
| Operations | [Security](security.md) → [storage](contracts/storage.md) → [deployment](deployment.md) |
| Swedish user | [Kom igång](users/kom-igang.sv.md) → [examples](users/exempel.sv.md) |

## Authority and maintenance

Approved decisions take precedence over illustrative examples. Contracts define required behavior. Implementation scopes identify dependencies and acceptance criteria; they do not weaken the contracts. Source facts are distinguished from project choices and unverified assumptions in [verification gates](reference/verification-gates.md).

Coverage means verified behavior, not merely a generated tool definition. All modules are currently **planned, not implemented**. Update affected documents together when a decision changes. Keep one current decision register rather than accumulating contradictory planning documents.

The repository intentionally has no installed SDK, runtime lockfile, executable server, CI pipeline or deployed environment at this stage.
