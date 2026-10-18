# Fortnox MCP — developer README

[Svensk presentation](README.md) · [Documentation](docs/README.md) · [Implementation scopes](docs/implementation/README.md)

An independent, community-oriented MCP server for working with Fortnox from AI clients. The goal is broad, reliable access to business data and actions, with multiple companies supported from the beginning.

**Status: approved design and implementation documentation. There is no runnable server or published package yet.** Examples describe intended behavior, not features already available. Development will be public, with prereleases before a stable 1.0 release.

## Start contributing

1. Read [AGENTS.md](AGENTS.md), the [approved decisions](docs/decisions.md) and [contribution guide](CONTRIBUTING.md).
2. Start with [S00: feasibility](docs/implementation/S00-feasibility.md) to verify authentication, client file handling and the embedded approval trust boundary.
3. Use [S01: foundation](docs/implementation/S01-foundation.md) to establish the executable development setup once the relevant feasibility questions are resolved.
4. Select a bounded task from [S00–S13](docs/implementation/README.md), follow its contracts and include evidence required by [the test strategy](docs/testing.md).

There are no installation or test commands to run yet. [Development setup](docs/development.md) describes the intended command contract; it must be implemented and verified before being presented as usable.

**Questions, issues and development discussions are welcome in Swedish or English.** Code, API identifiers and technical reference documentation use English. Use [GitHub Discussions](https://github.com/alex-engvall/fortnox-mcp/discussions) for questions and ideas, and issues for actionable tasks and defects.

The default README introduces the project to Swedish-speaking business owners across industries through practical examples. The project also welcomes accounting firms and developers, with multiple-company workflows as a core requirement.

## Intended experience

- Run your own installation using your own Fortnox integration credentials.
- Connect one user to several companies and work with explicitly identified companies.
- Read and write accounting, invoice, customer, supplier, order and receipt data.
- Prepare payroll inputs; full payroll processing is outside the initial scope.
- Supply account balances, transactions and traceable calculations for flexible analysis in your AI client.
- Review batches of receipts and, by default, approve manual vouchers through an embedded review interface.
- Search Fortnox API documentation and diagnose integrations.

ChatGPT is the first acceptance target. Claude follows, while the core uses standard MCP. Client-specific capabilities are tracked in the [compatibility contract](docs/contracts/clients.md).

## Start here

| You want to… | Read |
| --- | --- |
| Understand the product | [Product scope](docs/product.md) and [approved decisions](docs/decisions.md) |
| Prepare your own installation | [Getting started](docs/users/getting-started.md) / [Kom igång](docs/users/kom-igang.sv.md) |
| Implement a feature | [Architecture](docs/architecture.md), [scope queue](docs/implementation/README.md), [AGENTS.md](AGENTS.md) |
| Review accounting correctness | [Validation](docs/contracts/validation.md) and [test strategy](docs/testing.md) |
| Contribute | [CONTRIBUTING.md](CONTRIBUTING.md) |

## Deployment direction

TypeScript with a portable domain core, a Cloudflare adapter, and a Node.js/Docker adapter. A setup wizard will help connect Fortnox companies and an AI client. Cloudflare's free tier is an evaluation target, not a promise of unlimited free operation. Users remain responsible for hosting and required Fortnox subscriptions.

There is no centrally hosted project service at launch. There is no separate model API key requirement: interpretation happens in the AI client.

## License and independence

Project-authored code and documentation are licensed under [GNU AGPL version 3 only](LICENSE), SPDX `AGPL-3.0-only`. Commercial use and paid hosting are allowed under that license. The project's own distribution is intended to remain free of charge. The license does not prohibit resale.

This is an independent project, not an official Fortnox product. Fortnox names, services, API specifications and third-party materials are not relicensed by this repository; see [third-party notices](THIRD_PARTY_NOTICES.md).
