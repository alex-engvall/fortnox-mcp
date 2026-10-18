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

## Local rendered UI verification

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

## Hosted installation verification — 2026-10-18

The real installation flow was subsequently exercised through the user's Chrome browser on Windows. The target was an existing Cloudflare account with no Workers projects, using newly created test resources and the default name `fortnox-mcp-test`. This was not a newly registered Cloudflare account. No Fortnox company or financial records were accessed.

Source baseline: published `main` at [`5919269`](https://github.com/alex-engvall/fortnox-mcp/commit/5919269a777cd906baae5ac6cb6bde139f37bcb6), the merge of PR #9. Local HEAD and remote `main` were checked against that SHA after the run. Cloudflare created its own repository copy and populated resource configuration; the copied repository's build commit SHA was not captured. Workers Builds run: `7ffb40f4-ab8f-4493-908d-d1b928adcd85`, approximately 14:23:29–14:23:58 Europe/Stockholm. The UI reported 30 seconds total. The deployment log identified Wrangler **4.151.1**; hosted Node/npm versions were not captured and are not inferred from the local toolchain.

| Check | Observed result |
| --- | --- |
| Live installation button | Opened Cloudflare for the complete public repository; the original source needed no code change |
| Cloudflare identity and role | Initial member had only domain-scoped `Domain Administrator`; successful recovery used the owner's account-wide `Super Administrator - All Privileges` role |
| GitHub connection | GitHub App installation initially succeeded but Cloudflare returned `Error connecting to git account` before any build; after owner sign-in and replacement of the incomplete app installation, Cloudflare listed the intended GitHub account |
| Repository access | `Only select repositories` selected the source project; Cloudflare automatically added the new `fortnox-mcp-test` copy. Final list contained these two repositories, with `All repositories` unselected |
| Resource provisioning | Created the repository copy, Worker and D1 database; root directory `/`, no user-supplied build variables |
| Build | Detected `npm run build`; completed successfully |
| Database migration | `npm run deploy` ran `wrangler d1 migrations apply DB --remote --config wrangler.jsonc`; `0001_execution_intents.sql` applied successfully before publication |
| Deployment | `wrangler deploy --config wrangler.jsonc` completed; log showed the generated D1 binding and a Worker address |
| Hosted readiness page | Browser displayed `Servern svarar.` and `Databasen svarar och grundtabellen finns.` |
| Capability disclosure | Hosted page stated that Fortnox was not connected and ChatGPT/MCP was unavailable in this test version |

The generic callback error did not expose the exact rejected permission. The observations establish the successful recovery sequence, not that reinstalling by itself resolves every GitHub integration error. [Cloudflare's current role reference](https://developers.cloudflare.com/fundamentals/manage-members/roles/#domain-scoped-roles) documents account-wide Worker access as read-only for `Domain Administrator`, even though the member UI's description did not spell out that restriction. See [the troubleshooting procedure](../deployment.md#github-connection-fails-before-the-build).

Browser screenshots of the callback failure, member role, successful build and hosted readiness, plus a build UI transcript, were retained locally outside version control. Personal sign-in emails, callback codes, account/database identifiers and raw transcripts are intentionally excluded from this record.

## Remaining hosted acceptance

Still untested: brand-new Cloudflare/GitHub account onboarding, alternative resource names, an existing GitHub installation already serving other deployments, redeployment/restart, upgrade/backup/restore, repeated hosted migrations and separate Worker/D1 deletion. Direct hosted `/health` and `/mcp` requests, HTTP status/header assertions and the English status interaction were not rerun; their earlier local evidence remains separate.

Fortnox connection, owner authentication, ChatGPT/MCP authorization, confidential reporting and hosting budgets remain unverified. No production or test-company operation was run and no gate is closed by this slice.
