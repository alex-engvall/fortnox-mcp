# S00 CI evidence

Recorded on 2026-10-18. Status: workflow implemented; hosted success, intentional
failure and recovery verified in
[PR #7](https://github.com/alex-engvall/fortnox-mcp/pull/7).
Required-check enforcement has not been changed or verified; see the access
limitation below.

The [workflow](../../.github/workflows/s00-ci.yml) has one stable check,
`s00-offline`, on all pull requests and pushes to `main`. It runs the spike's
locked install, typecheck, offline tests, build and built-artifact tests in
separate fail-fast steps, without project secrets. Its runtime is GitHub-hosted
Ubuntu 24.04, Node 24.19.0 and npm 11.9.0.

The action pins were resolved from the official repositories on 2026-10-18 and
their input/runtime manifests inspected:

| Action | Release | Commit |
| --- | --- | --- |
| `actions/checkout` | v6.1.0 | `d23441a48e516b6c34aea4fa41551a30e30af803` |
| `actions/setup-node` | v6.5.0 | `249970729cb0ef3589644e2896645e5dc5ba9c38` |

## Verification

Locally, actionlint 1.7.9 accepted `.github/workflows/s00-ci.yml` with no findings.
Its Linux release archive was checked against the published SHA-256 checksum.
The five workflow commands passed locally: 61 behavior tests and 2 artifact tests,
no failures or skips. Relative Markdown file links and `git diff --check` passed.

| Scenario | Commit | Hosted run | Observed result |
| --- | --- | --- | --- |
| Initial workflow | `dccdb420a1f3cde9cdd36f99b96d5556249c3016` | [Run 1](https://github.com/alex-engvall/fortnox-mcp/actions/runs/39120434834) | `s00-offline` succeeded. All five checks passed; logs report 61 + 2 passing tests and no failures/skips. |
| Intentional test failure | `a350d21cfe6f48b41eb3f505f799e766ff378b16` | [Run 2](https://github.com/alex-engvall/fortnox-mcp/actions/runs/39120472476) | `s00-offline` failed at `Test offline behavior`: 61 passed, 1 failed, exit code 1. Typecheck passed; build and built-artifact test steps were skipped. |
| Restored tests | `36d115da33ad9f12a689272a8a76eb962d5913f8` | [Run 3](https://github.com/alex-engvall/fortnox-mcp/actions/runs/39120541376) | `s00-offline` succeeded again. All five checks passed, including 61 behavior tests and 2 built-artifact tests, with no failures/skips. |

The negative probe temporarily added `test/ci-failure-probe.test.ts` with one
unconditional failing assertion. It changed no server code or existing tests.
After observing the hosted failure, the file was removed in
`36d115da33ad9f12a689272a8a76eb962d5913f8`. The probe and removal remain explicit
in history; the final source tree contains no intentional failure or skip.
The workflow, server and tests are identical between the initial and restored
commits. A subsequent evidence-only commit records these results.

The hosted evidence currently exercises the `pull_request` trigger. The `main`
push trigger is configured and syntax-checked, but no merge or push to `main`
was performed to test it. Cache restore/save and runner setup are infrastructure
behavior, not evidence for any live product integration.

## Required-check enforcement: not applied

The read-only attempt `gh api repos/alex-engvall/fortnox-mcp/rulesets` returned
`Forbidden`. The available GitHub connector has no ruleset/branch-protection
operation, and no browser-control tool is connected. Existing rules could not
be inspected safely, so no repository ruleset or protection setting was changed.
The green CI check must not be described as an enforced merge requirement yet.

An administrator can finish this in
[Settings → Rules → Rulesets](https://github.com/alex-engvall/fortnox-mcp/settings/rules):

1. Add an active branch ruleset named `Require S00 offline CI`, targeting only
   `refs/heads/main`. Preserve existing rulesets and branch protection.
2. Require a pull request before merging; no additional review-count policy is
   introduced by this CI change.
3. Require status check `s00-offline`, selecting GitHub Actions as its source,
   and require the branch to be up to date before merging.
4. Do not add a bypass actor for this check. Save, inspect the effective rules
   for `main`, and verify the PR merge requirements show `s00-offline` as required.

This setting is separate from the workflow commit. No merge, deployment or
production operation is authorized by this verification.

This CI covers the synthetic spike only. It does not verify ChatGPT auth,
embedded approval, multi-file transfer, Fortnox integration, live Cloudflare
execution or any other unresolved [S00 gate](S00-spike-evidence.md).
