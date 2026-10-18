# S11 first slice — Cloudflare test installation

Status: implemented infrastructure slice; hosted first-account acceptance is pending. Builds on S01. This does not complete S11, S02 or any live authentication/client gate.

## User journey and scope

The Swedish website and default README lead to `/installera/`. Its active **Installera testversion på Cloudflare** link opens the official Deploy to Cloudflare flow for the complete public repository. Cloudflare copies the repository to the owner's GitHub account, provisions a Worker and D1 binding, and uses the root build/deploy scripts. The Worker address opens a bilingual status page.

The owner explicitly requested an active button from the first publication. The page states that first-account Cloudflare acceptance is not yet verified. Local tests and a Wrangler dry run must not be presented as that evidence. Publish this slice together with its S01 dependency and root configuration; the button targets the default branch.

This is an infrastructure test. It does not request credentials, establish an owner, connect Fortnox, expose remote MCP, or read/change company data. The public status page is not an administration interface. All financial/provider modules remain disabled.

## Implementation plan

1. **Distribution:** root `wrangler.jsonc` selects `apps/worker/src/installation.ts`, enables the Worker address and declares `DB`. Deploy to Cloudflare replaces placeholder IDs with the installing account's resources. Keep the whole repository: `apps/worker` alone is not self-contained.
2. **Build:** retain the exact `.nvmrc` Node version and npm 11.9.0 development/CI toolchain. Allow npm 10.9.2–11.x for Cloudflare's documented build image; verify its locked install too. No secret is needed; `.env.example` contains comments only so the button does not prompt for the Node-only port.
3. **Deployment:** `npm run deploy` runs the migration through binding `DB` before `wrangler deploy`. Resolving by binding preserves user-selected database names. Failed migrations prevent publication. Wrangler tracks applied migrations.
4. **Readiness:** `GET /`, `/setup` and `/health` check the required schema without reading stored rows. Missing bindings, missing migrations and incompatible tables return `503`; successful checks return `200`. `HEAD` has no body. HTML defaults to Swedish; `?lang=en` selects English. Unknown language input is never interpolated.
5. **Boundary:** this entry imports only the UI, not MCP or Fortnox. `/mcp` is always `403`, including on loopback; unimplemented paths return `404`. Status routes are read-only. The local synthetic MCP entry retains its loopback restriction and independent Wrangler config.
6. **Presentation:** shared site styles, relative assets, active homepage navigation/CTA and README button. Guidance works without JavaScript. Worker responses use `no-store`, a restrictive CSP and no raw exception details.

## Verification and publication

- Run strict typecheck, lint, Node/domain/workerd suites, installation tests and built-artifact checks.
- Dry-run Wrangler with the root config; apply migrations locally and confirm harmless reapplication.
- Start the deployment entry locally and inspect `/`, `/setup?lang=en`, `/health` and blocked `/mcp`.
- Check site links, assets and the GitHub Pages prefix. Inspect desktop/mobile, keyboard navigation, no-JavaScript content and active links. An intercepted outbound navigation proves the button destination only, not Cloudflare account setup.
- In a fresh owner account, exercise the real button with different resource names, verify migration/build logs and readiness, redeploy, then remove Worker and D1 separately. Record date, commit, versions, outcomes and limitations before claiming this path is verified.

The final item requires account access not configured in this environment. No hosted deployment, provider/client test, resource-budget claim or gate closure follows from this slice. See [evidence](S11-cloudflare-evidence.md).

## Following slices

1. **S00/S02:** verify maintained authentication components; implement owner bootstrap, admin sessions and authenticated MCP grants. Resolve confidential reporting before a product prerelease.
2. **S02:** securely store the owner's own Fortnox credentials, verify consent/test-company identity, revocation and multiple-company isolation. Preserve default approval policy.
3. **S03:** add verified read capabilities with shared authorization and bounded provider access. Publish ChatGPT instructions after G01 acceptance.
4. **Remaining S11:** extend this entry into the protected wizard; add upgrade/backup/restore/rotation and measured hosting requirements. Review/file workflows retain S06/S07 dependencies.

## Upstream evidence

Read on 2026-10-18: [Deploy to Cloudflare](https://developers.cloudflare.com/workers/platform/deploy-buttons/) (updated 2026-10-12) and [Workers Builds image](https://developers.cloudflare.com/workers/ci-cd/builds/build-image/) (updated 2026-10-14). These document automatic D1 provisioning, binding descriptions, migrations, monorepo constraints, `.nvmrc` selection and npm 10.9.2. They do not verify this repository's hosted installation.
