# S00 authenticated MCP feasibility probe

Experimental and isolated. The hosted MCP/OAuth server remains synthetic-only;
the separate local G04 operator process can read an explicitly allowed Fortnox
test company's identity after owner consent. This is not the product's S02 auth
implementation. It preserves the unauthenticated loopback transport baseline in
`../s00-mcp` and does not change the root Worker or existing test installation.

The probe exposes one `read_synthetic_status` tool behind OAuth. Better Auth
`1.7.10` and its OAuth provider handle S256 PKCE, exact redirects, RFC 8414/9728
discovery, RFC 9207 issuer identification, expiring single-use authorization
codes, resource-bound opaque tokens, refresh rotation and revocation. A
server-only provider extension validates tokens against the same database on
every MCP request, then checks issuer, resource, scope and the provisioned owner.
No passwords, bootstrap codes, cookies or bearer tokens are model-callable.

All sixteen local tests pass, including the bundled workerd/D1 flow and five
operator-only Fortnox checks. A separate
HTTPS test instance and database were deployed. In a personal ChatGPT Pro
account, metadata/DCR discovery, owner login/consent and a real synthetic tool
call succeeded. Automatic refresh after expiry, disconnect/revocation and
immediate reconnection also succeeded. A later idle check found the reconnected
grant lacked `offline_access`. The corrected challenge and tool declaration now
request refresh access too; live reverification remains pending.
The account's Reload tools action still fails on
a preflight unrecognized by this JSON-RPC adapter.
See the evidence record for remaining protocol/lifecycle limits; this is not
production client support.

The HTTP adapter forwards an explicit auth endpoint allowlist. Public signup,
password login/reset, token generation, OAuth administration and the internal
verification endpoint are unavailable. Browser mutations require a same-origin
owner cookie. Only the one-time-token verification may start without that
cookie. The operator generates a five-minute, single-use code outside the model.
OAuth login still requires a separate consent action. MCP tokens cannot become
admin sessions. The probe supports bearer tokens only; it rejects DPoP-bound
tokens instead of silently discarding sender constraints.

## Repeatable checks

Use Node `24.19.0` and npm `11.9.0`, from this directory:

```sh
npm ci --ignore-scripts
npm run typecheck
npm run lint
npm run build
npm test
npx --no-install wrangler deploy --dry-run --config wrangler.example.jsonc
```

Tests use synthetic fixtures and real Better Auth endpoints. One test runs
the bundled Worker in local workerd with D1; it is not a Node mock. Runtime
budgets and hosted-client behavior require separate evidence. `npm test`
requires the Worker bundle from `npm run build`.

For a bounded live protocol check, the Worker accepts the optional
`PROBE_PROTOCOL_DIAGNOSTICS=true` variable. It emits only the requested and
SDK-negotiated protocol version after a successful initialize
request. Other RPC fields, client metadata and credentials are never forwarded
to the version diagnostic. A separate diagnostic labels anonymous requests with
fixed method names and framing-validity booleans; unknown input becomes `other`.
It is off by default. Keep stored observability disabled,
filter a short-lived operator tail to these allowlisted fields with Wrangler
disk logging disabled, then turn the variable off again. This does not add a
model-callable diagnostic or change protocol selection.

Fixed protocol/tool schemas are public for ChatGPT's metadata refresh:
`initialize`, `notifications/initialized` and `tools/list`. All other methods,
including every tool call and resource request, require OAuth. Every member of
a batch must be public to qualify, and invalid supplied credentials fail closed
instead of falling back to anonymous metadata. This exposes no owner data or
financial capability; it is specific to this static synthetic catalog.

## Local Fortnox connection probe (G04)

This separate operator-only process is not exposed by the Worker or MCP tool.
Create an unpublished integration with enforced PKCE, service authorization,
redirect `http://localhost:8789/callback`, and only `companyinformation profile`.
Create a dedicated sandbox and accept its invitation. Verify its numeric tenant
ID in the portal before configuring the local allowlist. Do not use a production
company or infer a tenant ID from an unverified token.

Write ignored `.data/fortnox-operator.json` with your public integration Client
ID, verified test tenant ID and local display name:

```json
{"clientId":"YOUR_CLIENT_ID","testTenantId":"YOUR_NUMERIC_TEST_TENANT","testName":"Your S00 sandbox"}
```

Run `node --import tsx src/fortnox-operator.ts` and open
`http://localhost:8789`. Enter Client Secret yourself in the password field,
then choose service mode and complete Fortnox login/consent personally. The
process holds the secret only in memory, binds loopback only, requires same-host
session/CSRF protection and stops after 30 minutes. Its trust boundary is the
local operator/OS; it is not a production admin UI. Run the user-mode probe
separately to test refresh rotation. Only aggregate, identity-free results are
saved to `.data/fortnox-evidence.json`; no tokens are persisted. Stop the process
when finished. The result does not establish durable rotation or expiry recovery.

Five offline checks cover callback/state/PKCE, concurrent replay, wrong-tenant
denial, request mapping/result privacy and actual loopback form protections.
They do not alone prove live Fortnox acceptance. On 2026-10-18 the owner also
completed both live consent flows in a dedicated sandbox. Service/client
credentials and user refresh rotation passed with matching tenant identity;
`/me` returned `SysAdmin: false` for service and `true` for this user. This closes
G04 for the two selected identity scopes. Expiry recovery, durable rotation,
concurrency, revocation and broader provider use remain unverified. See
[G04 evidence and prerequisites](../../docs/implementation/S00-fortnox-evidence.md).

## Operator-only provisioning

Use a **new isolated** Worker and D1 database named `fortnox-mcp-s00-oauth`.
Do not point this spike at the root application's database or a real company.
The example Wrangler config contains a placeholder database ID and cannot
provision a usable installation by itself.

After Wrangler login and creation of the separate D1 database:

```sh
node --import tsx scripts/seed.ts https://YOUR-TEST-WORKER.workers.dev
node --import tsx scripts/prepare-deployment.ts YOUR_ACCOUNT_ID YOUR_NEW_D1_ID
npx --no-install wrangler d1 execute fortnox-mcp-s00-oauth --remote --file .data/seed.sql --config .data/wrangler.json
npx --no-install wrangler deploy --config .data/wrangler.json
npx --no-install wrangler secret bulk .data/secrets.json --config .data/wrangler.json
```

The seed command creates a synthetic owner with an undisclosed random password
and issues a Better Auth one-time login token. Its code expires in five minutes;
finish deployment and enter it promptly at `/sign-in`. Do not send it to chat.
The HTTP adapter never allows that random password or public signup to log in.
No owner can be claimed by visiting an uninitialized public server. Missing
secrets/owner binding return 503. Re-running seed against existing state fails.
The private config retains the original 24-hour operator cookie. While it is
valid, `node --import tsx scripts/mint-login.ts` writes a fresh code and a
single-row `.data/login.sql`. Import that file into the same isolated D1 database
with the command above before using the code. It does not overwrite remote
OAuth clients/grants. Production owner recovery and lifecycle are out of scope.

All provisioning files, SQL dumps and databases remain under ignored `.data/`.
They contain credentials. Keep them private, apply local access controls and
remove the disposable test environment when finished. Never upload these files
or logs to GitHub. This prototype is not a backup/restore or production bootstrap
solution.

For a local run, use the default seed origin `http://127.0.0.1:8790`, then `npm run dev`.

## ChatGPT acceptance

In ChatGPT, use Plugins → plus → Add custom MCP server, enter the verified HTTPS
`/mcp` endpoint and choose OAuth/DCR. Set base scopes `mcp:read offline_access` and default scopes
`mcp:read offline_access`. Review the risk notice and create the private plugin,
then complete account linking, the one-time login and consent. Resume the saved
connection rather than creating a duplicate if the browser flow is interrupted.
If a signed login link expires, do not edit or reuse it. Sign in first on the
short `/sign-in` page with a fresh local code, then resume Connect in ChatGPT to
obtain a fresh signed consent request. Login and OAuth consent remain separate.
The portable archive generated by `scripts/package-plugin.ts` is separate; the
observed catalog marks its raw MCP connection desktop-only, so importing that
archive alone does not prove a ChatGPT connection.

This probe advertises
RFC 9207 and permits only the exact stable ChatGPT callback
`https://chatgpt.com/connector_platform_oauth_redirect`. DCR metadata is not proof
that the registrant is ChatGPT; the owner must review the client before consent.
No client-metadata URL fetching or arbitrary callback URL is enabled.

Record actual discovery, browser consent, tool discovery/call and reconnection
before closing G01. The selected SDK `1.32.1` negotiates `2025-11-25`/`2025-06-18`;
the newer `2026-07-28` profile and CIMD are not claimed. No Fortnox/provider,
embedded review, file-transfer or production-auth acceptance follows from this
probe. See [the evidence record](../../docs/implementation/S00-oauth-evidence.md).

Primary implementation references:
[OpenAI OAuth](https://developers.openai.com/plugins/build/auth),
[Better Auth OAuth provider](https://better-auth.com/docs/plugins/oauth-provider),
[one-time token](https://better-auth.com/docs/plugins/one-time-token).
