# S01 — Executable TypeScript foundation

Status: not started. Depends on S00 mechanism/version decisions.

## Deliver

Create the workspace from [architecture](../architecture.md): pure core, provider/MCP packages, Node/Worker entry points and minimal UI package. Add strict TypeScript, runtime schema validation, exact decimals, lockfile, supported runtime/package-manager versions and environment examples without secrets.

Implement offline test scaffolding, lint/typecheck/build commands and CI for untrusted contributions without secrets. Define storage/secret/clock/HTTP interfaces. Add the initial durable intent/state-transition adapter tests for both runtime candidates.

## Acceptance

Documented setup works on a clean environment; intended commands in [development](../development.md) now run. Both runtime skeletons return a harmless synthetic read-only tool without exposing anonymous private data. Decimal tests and atomic state/concurrency tests pass. Default logging is redacted and local servers bind to localhost.

Verify confidential security-reporting availability before any installable prerelease. No Fortnox production credentials or full external spec is committed.

## Handoff

Update actual commands/version requirements, CI documentation and runtime limitations. Avoid starting business features inside this scope.
