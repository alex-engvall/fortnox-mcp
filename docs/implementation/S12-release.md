# S12 — Client acceptance and release readiness

Status: not started. Depends on S04–S11 and applicable verification gates.

## Deliver

Execute the [stable coverage and quality gates](../releases.md), add client/deployment acceptance records and complete release automation for immutable prerelease artifacts. Check license/source availability, dependency SBOM, security-reporting route and bilingual user instructions.

Test ChatGPT as the first complete end-to-end target. Add Claude evidence next without assuming UI/file parity. Publish an honest matrix of core versus embedded-review/file support.

## Acceptance

Each mandatory common workflow has a verified synthetic scenario and failure/recovery evidence. No unresolved blocker for an advertised capability. Unsupported specialist APIs and runtime limits are explicit. Install, upgrade, backup/restore and disconnect work according to the guide.

Prerelease notes identify scope gaps. Stable 1.0 requires maintainer approval of the completed gate record, not just successful CI or a count of generated tools. Publishing/merging is a separate authorized action from implementing this scope.

## Handoff

Provide exact release commit, test evidence, compatibility matrix, known limitations, source/build artifacts and rollback/recovery instructions. Never expose integration secrets through release workflows or untrusted fork runs.
