# S00 Fortnox connection probe (G04)

Status on 2026-10-18: **G04 passed for the owner's isolated test company and
`companyinformation profile` scopes**. Service consent/client credentials,
user refresh rotation, tenant identity and `/me` semantics were verified live.
This is an isolated read-only experiment,
not a product connector or permission to use production bookkeeping data.

## Observed setup

In the owner's existing Fortnox developer portal, a new dedicated sandbox was
requested. The owner accepted the email invitation, the new sandbox appeared in
the portal, and its lobby opened successfully. Its numeric identity was checked
in the authenticated sandbox list and used as the private operator allowlist.

With explicit action-time owner approval, a separate integration was created.
Fortnox rejected the proposed name containing its trademark; the integration
was created under a neutral test name and remained **unpublished**. Its OAuth
settings have service-account authorization enabled, enforced S256 PKCE,
`http://localhost:8789/callback`, and only `companyinformation profile` selected.
The save completed with the Save button disabled. Client Secret was never
revealed or copied by the operator agent. The owner subsequently entered it
privately and approved service consent for this sandbox only.

Private company names, tenant/client identifiers, screenshots and credentials
are deliberately excluded from this evidence file and test fixtures.

## Executable operator probe

The [probe](../../spikes/s00-oauth/src/fortnox-probe.ts) uses pinned
`oauth4webapi` **3.8.8** for state/authorization-response validation, S256 PKCE,
Basic client authentication and code, refresh and client-credentials requests.
Endpoint metadata is pinned from Fortnox's guide; discovery support or RFC 9207
support is not inferred. The callback must match exactly, expires after ten
minutes and can be claimed only once before asynchronous token exchange.

The [local operator process](../../spikes/s00-oauth/src/fortnox-operator.ts)
binds only `127.0.0.1:8789`, accepts only Host `localhost:8789`, and requires a
local HttpOnly session cookie, same-origin form POST and CSRF token. The process
stops after 30 minutes. The owner enters Client Secret privately in a password
field; it is held in process memory and not written to disk. This trusts the
local operator/OS and is not a remote owner-authentication implementation.

The configured numeric test tenant is an operator allowlist, not proof of a
grant. After code exchange the probe reads Company Information, compares the
provider's DatabaseNumber exactly, and stops on a mismatch before `/3/me`,
refresh or client-credentials issuance. It never decodes a JWT to infer consent.
All upstream requests are restricted to Fortnox's HTTPS token endpoint and GET
`/3/companyinformation` and `/3/me`, with no redirects, 15-second timeouts and
64-KiB response limits. No bookkeeping or file operation is available.

For service mode the probe uses `account_type=service`, exchanges the code,
checks identity, then requests a new token with the verified/allowlisted
TenantId and repeats the reads. For user mode it omits `account_type`, requests
`access_type=offline`, rotates a refresh token once and repeats the reads. It
does not retain replacement tokens or implement durable refresh storage.
An immediate refresh is evidence of the endpoint path, not reuse after the
provider's one-hour access-token expiry.

Only aggregate evidence is returned or saved to ignored `.data/`: mode,
tenant-match booleans, token lifetimes/refresh presence, profile HTTP status,
allowlisted field-presence labels and the boolean SysAdmin value if present.
Names, email addresses, tenant IDs and tokens are excluded. `/me` failures are
recorded rather than treated as an administrative identity. No upstream error
body is reflected in the UI/log. A process restart intentionally requires
private re-entry and a new consent flow; no token recovery is promised.

## Checks and remaining evidence

Five offline checks passed with Node 24.19.0, TypeScript 7.0.2 and Biome 2.5.15:

- OAuth parameters, independent state/verifier, fixed redirect and account mode.
- Wrong state/redirect/expiry and concurrent callback replay reject before a
  second exchange.
- A mismatched synthetic tenant stops before identity/client-credentials access.
- Mocked service issuance and user refresh exercise request mapping and ensure
  exported results contain no fixture identity or credential values.
- An actual loopback operator process rejects DNS-rebinding Host headers,
  missing sessions, cross-origin/forged forms and oversized input; it redirects
  only to the fixed Fortnox authorization endpoint and shuts down on request.

These offline checks alone do **not** establish Fortnox acceptance. The live
results below close the scoped G04 probe. Broader S00
and S01 acceptance still requires the other [verification gates](../reference/verification-gates.md).

## Live service result — 2026-10-18

The owner entered Client Secret privately and completed Fortnox's service
consent in Chrome. The selected company was the dedicated sandbox. S256 code
exchange succeeded and returned a 3,600-second access token plus a refresh
token. Company Information matched the exact test tenant allowlist. `/3/me`
returned HTTP 200, `SysAdmin: false`, and the allowlisted field-presence labels
`SysAdmin`, `Name` and `Email`; actual names/email values were discarded.

A separate client-credentials issuance with the same confidential client and
the verified numeric TenantId succeeded without another interactive grant.
Its reported access lifetime was also 3,600 seconds. Company identity matched
again, and `/3/me` again returned 200 with `SysAdmin: false` and the same field
labels. This verifies the service-consent → code exchange → tenant verification
→ client-credentials → company/profile read path. It does not establish that a
service token identifies the authorizing human or grants owner-policy rights.

The first local HTML-form attempt was rejected before provider access. Its
`no-referrer` policy conflicted with strict Origin validation for navigation-mode
POSTs. The operator now uses `same-origin`, while null/foreign origins still
fail. Another attempt lacked a matching local session after a process restart.
A fresh Chrome tab and harmless `/check` form verified session, Origin and CSRF
in the same running process before the successful private handoff. The older
failed tab was closed. No credential was logged or persisted during diagnosis.

## Live user result — 2026-10-18

The owner separately approved the ordinary user flow with `access_type=offline`
and no service account parameter, for the same sandbox and scopes. S256 code
exchange returned a 3,600-second access token plus a refresh token. Company
Information matched the test allowlist; `/3/me` returned 200 with
`SysAdmin: true` and the same field-presence labels. The probe then exchanged
the refresh token once. Fortnox returned a different replacement refresh token;
the resulting access token again matched the company and `/3/me` again returned
200 with `SysAdmin: true`.

This establishes both required G04 connection paths and the observed distinction
between this human user's profile and the service account. It does not grant
product policy-administration rights from either upstream profile. Refresh was
performed immediately, not after one-hour expiry; refresh concurrency, durable
replacement storage, revocation and other resource/license combinations remain
S02/provider acceptance work. No financial mutation was performed.

The owner-supplied Client Secret remained in the local operator process only.
After both results, the stop action cleared its state and the dedicated process
was terminated. Aggregate results and screenshots remain outside Git. The live
core source SHA-256 was
`f7f978649dc3b00306c0603a150ecf41699b9907e64e110da9cef8e05137da2b`;
the wrapper was subsequently hardened to terminate its TS-runtime helper threads
after graceful HTTP shutdown. No Worker/Fortnox secret was added to the root app.

Primary references: [developer portal](https://www.fortnox.se/developer/developer-portal),
[authorization parameters and PKCE](https://www.fortnox.se/developer/authorization/get-authorization-code),
[client credentials and TenantId](https://www.fortnox.se/developer/authorization/get-access-token-using-client-credentials),
[scope mapping](https://www.fortnox.se/developer/guides-and-good-to-know/scopes),
and [maintained OAuth client example](https://github.com/panva/oauth4webapi/blob/main/examples/oauth.ts).
