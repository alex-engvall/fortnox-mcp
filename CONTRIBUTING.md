# Contributing

We welcome code, tests, documentation, translations and practical feedback from business owners and accounting firms. The project is independent and community-oriented.

## Current state

This repository starts with an approved specification. There is not yet an installable server. Start with [the scope queue](docs/implementation/README.md); S00 and S01 establish feasibility and the executable development setup.

## Contribution flow

1. Find or open an issue with a concrete use case and expected result. Check the [decisions](docs/decisions.md) and coverage matrix first.
2. Work on a branch and keep the scope small enough to review. Discuss product changes before implementing them.
3. Add behavior tests appropriate to the change and update affected English and Swedish documentation.
4. Open a PR describing the problem, resulting behavior, evidence and remaining limitations. Include the scope ID.
5. A maintainer reviews correctness, authorization, data handling and compatibility before merging.

AI-assisted contributions are welcome. The submitter remains responsible for understanding and verifying the change. Include which tests ran and disclose unresolved assumptions; fabricated test results or source claims are unacceptable.

## Development conventions

- TypeScript with strict checking; explicit runtime schemas at external boundaries.
- Exact decimal money values, explicit company and fiscal-year context, UTC instants and Swedish business-date handling as specified in contracts.
- Prefer a small number of runtime dependencies and the official MCP SDK. Select and lock tested versions during S01, following S00 compatibility evidence.
- No production data in examples. Use synthetic data that cannot be mistaken for real customers.
- No direct provider requests from tool handlers that bypass the domain layer.

The intended command contract is documented in [development setup](docs/development.md). It is not executable until S01 is implemented.

## Licensing

By submitting a contribution, you agree to license your original contribution under the repository's AGPL-3.0-only license and confirm you have the right to submit it. Copyright remains with contributors. No copyright assignment or separate CLA is required at this stage. Maintainers cannot grant exceptions over another contributor's work without the necessary rights.

Do not copy upstream documentation, specifications or code merely because it is publicly accessible. Record provenance and permissions; see [third-party notices](THIRD_PARTY_NOTICES.md).

Read the [code of conduct](CODE_OF_CONDUCT.md) and use the [security reporting process](SECURITY.md) for vulnerabilities.
