# Security policy

There is currently no executable release. Once prereleases exist, only the latest prerelease is supported until a stable support policy is published. Do not assume early releases are production-ready.

## Reporting

Use GitHub's **Report a vulnerability** option on this repository if it is enabled. If unavailable, open an issue titled **Request for private security contact** containing no exploit details, customer data or secrets, and wait for a private reporting route. Do not post a vulnerability publicly while arranging that route.

GitHub private vulnerability reporting was verified enabled on 2026-10-18 through
the repository API and Security overview. Confidential submission/delivery has
not been tested. The maintainer must test that route before the first installable
prerelease; no response SLA is promised. See the [S01 evidence](docs/implementation/S01-evidence.md).

Useful private reports include affected version, deployment mode, client/version, prerequisites, reproduction with synthetic data, impact and a proposed mitigation if known.

## Scope

Especially relevant: cross-company access, credential disclosure, approval bypass, unauthorized setting changes, duplicate financial writes, unsafe file URLs, malicious document instructions and dependency vulnerabilities.

Never test against another person's company or the public Fortnox service without authorization. Use your own installation and an authorized test company.

Implementation requirements are in [security design](docs/security.md), [authentication](docs/contracts/authentication.md), [approval](docs/contracts/approval.md) and [testing](docs/testing.md).
