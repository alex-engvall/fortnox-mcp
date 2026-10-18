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
| Project website | [Website source](../index.html) → [Installera source](../installera/index.html) → [development and publishing](website.md) |
| Operations | [Security](security.md) → [storage](contracts/storage.md) → [deployment](deployment.md) |
| Swedish user | [Project introduction](../README.md) → [Kom igång](users/kom-igang.sv.md) → [examples](users/exempel.sv.md) |

## Authority and maintenance

Approved decisions take precedence over illustrative examples. Contracts define required behavior. Implementation scopes identify dependencies and acceptance criteria; they do not weaken the contracts. Source facts are distinguished from project choices and unverified assumptions in [verification gates](reference/verification-gates.md).

Coverage means verified behavior, not merely a generated tool definition. All modules are currently **planned, not implemented**. Update affected documents together when a decision changes. Keep one current decision register rather than accumulating contradictory planning documents.

The isolated [S00 spike](../spikes/s00-mcp/README.md) now contains a pinned SDK, lockfile, executable synthetic server, offline tests and a [CI workflow](testing.md#continuous-integration). It is not a production module or Fortnox implementation. No MCP environment is deployed. See the [spike evidence and unresolved gates](implementation/S00-spike-evidence.md) and the separate [CI evidence](implementation/S00-ci-evidence.md).

The [S01 root workspace](development.md) adds a locally verified TypeScript foundation, Node/Worker entries and SQLite/D1 adapter tests in actual local workerd. [S01 evidence](implementation/S01-evidence.md) distinguishes this foundation from pending remote authentication, hosted-client acceptance and Fortnox features.

The [first S11 slice](implementation/S11-cloudflare-first-installation.md) adds an active Cloudflare test-installation button and public Worker/D1 status page. It adds no provider coverage or remote MCP access. [Evidence](implementation/S11-cloudflare-evidence.md) separates local verification from one successful hosted installation in an existing account and the remaining fresh-account/lifecycle checks. [Deployment troubleshooting](deployment.md#github-connection-fails-before-the-build) covers the observed Cloudflare identity/role and incomplete GitHub connection failure.
