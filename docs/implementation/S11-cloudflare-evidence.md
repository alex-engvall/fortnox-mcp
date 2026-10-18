# First Cloudflare installation — evidence

Date: 2026-10-18. Scope: [S11 first slice](S11-cloudflare-first-installation.md), on S01. Synthetic infrastructure only.

Implementation commit: [`629100c`](https://github.com/alex-engvall/fortnox-mcp/commit/629100c56cd2226a8e654f81c71dae51d50e63b5), [PR #9](https://github.com/alex-engvall/fortnox-mcp/pull/9), stacked on S01 in PR #8. Both hosted workflows passed on that source commit: [S00 CI run 8](https://github.com/alex-engvall/fortnox-mcp/actions/runs/39125095083) and [S01 CI run 3](https://github.com/alex-engvall/fortnox-mcp/actions/runs/39125095092), including the root Wrangler dry run. This evidence follow-up changes documentation only.

## Local evidence

Environment: Linux x64, Node 24.19.0, npm 11.9.0, Wrangler 4.151.1, Chromium and Playwright 1.62.0. All operational test inputs were synthetic. No new runtime dependency was added.

| Check | Result |
| --- | --- |
| Clean locked install using `npx --yes npm@10.9.2 ci --ignore-scripts --no-audit --no-fund` | Passed; verifies compatibility with Cloudflare's documented npm default |
| `npm run typecheck` and `npm run lint` | Passed; strict source/Worker/test graphs and 46 linted files |
| `npm run test:node` | 24 tests passed, including existing SQLite/workerd process restart checks |
| `npm run test:worker` | 17 tests passed inside actual local workerd: 9 existing foundation tests and 8 new installation tests |
| `npm run build` and `npm run test:build` | Passed; 3 artifact tests with dynamic code generation disabled |
| `npx wrangler deploy --dry-run --config wrangler.jsonc --outdir /tmp/fortnox-installation-dry-run` | Passed; separate installation bundle 6.64 KiB before compression, 2.78 KiB gzip; not a CPU/free-tier benchmark |
| `npm run db:migrate:local`, then repeat | Migration applied locally; repeat reported no pending migrations |
| `npm run dev:installation -- --port 8811` | Real local Wrangler entry served Swedish/English status with ready D1; `/health` returned 200 and `/mcp` 403 |
| Relative documentation/site links, HTML anchors, CSS assets and whitespace | 238 local links/assets passed; GitHub file targets checked against the source; `git diff --check` passed |

Wrangler's optional `Request.cf` retrieval was unavailable in the restricted environment and used its documented local fallback. SDK package sourcemap-source warnings did not fail tests. The hosted CI workflow now includes a dry run of the root deployment config without account credentials.

## Rendered UI verification

The flow under test was: homepage → **Installera testversion** → installation page → active Cloudflare link. No associated Browser automation tool was callable in this environment; used the already installed Python Playwright and `/usr/bin/chromium`, with no dependency changes. Website served at `http://127.0.0.1:8810/fortnox-mcp/`; local Worker at `http://127.0.0.1:8811`.

| Check | Result |
| --- | --- |
| Page URL/title, meaningful content and no framework overlay | Passed |
| Viewports 1440×1000, 390×844 and 320×740 | Passed; no horizontal overflow, missing required resources or clipping observed |
| Website runtime console / page errors | No relevant errors; only the optional missing favicon was excluded |
| Keyboard skip link and active-page navigation | Passed |
| No JavaScript | Installation content, deployment link and navigation remained usable |
| Active deployment control | Click navigated to the exact official Cloudflare URL with the full repository encoded; the external destination was intercepted, not used for account setup |
| Worker status interaction | Swedish → English → check again → Swedish passed; D1 ready, MCP blocked |
| Screenshot inspection | Desktop/mobile installation page and Worker status page inspected; screenshots kept outside the repository |

Temporary QA scripts and screenshots are outside version control. Application tests total **44 passed** across the Node, workerd and built-artifact suites. Hosted acceptance below remains separate.

## Pending hosted acceptance

No Cloudflare credentials, account bindings or outbound Cloudflare identity are configured in this environment. The real button flow, account/repository authorization, resource provisioning, Workers Builds, hosted migrations/deployment, custom resource names, remote restart/redeployment and deletion have **not been tested**.

The button is active as requested. The public page discloses pending first-account verification. It targets the repository root on the default branch and becomes usable when this configuration is present there; an unmerged PR does not publish the GitHub Pages route.

Fortnox connection, owner authentication, ChatGPT/MCP authorization, confidential reporting and hosting budgets remain unverified. No production or test-company operation was run and no gate is closed by this slice.
