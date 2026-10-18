# S00 CI evidence

Status: workflow implemented; hosted execution and required-check enforcement
are being verified in PR #7. This record will be updated with observed results.

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

This CI covers the synthetic spike only. It does not verify ChatGPT auth,
embedded approval, multi-file transfer, Fortnox integration, live Cloudflare
execution or any other unresolved [S00 gate](S00-spike-evidence.md).
