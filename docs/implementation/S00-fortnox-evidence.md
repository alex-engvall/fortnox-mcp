# S00 Fortnox connection probe (G04)

Status on 2026-10-18: **operator setup and offline checks complete; live provider
acceptance pending owner activation**. This is an isolated read-only experiment,
not a product connector or permission to use production bookkeeping data.

## Observed setup

In the owner's existing Fortnox developer portal, a new dedicated sandbox was
requested. Fortnox displayed that it was being created and that the owner must
accept an email invitation. The sandbox list still showed only the older
environment at the last observation. No new test tenant ID is assumed.

With explicit action-time owner approval, a separate integration was created.
Fortnox rejected the proposed name containing its trademark; the integration
was created under a neutral test name and remained **unpublished**. Its OAuth
settings have service-account authorization enabled, enforced S256 PKCE,
`http://localhost:8789/callback`, and only `companyinformation profile` selected.
The save completed with the Save button disabled. Client Secret was never
revealed or copied by the operator agent. No customer account has been connected.

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

These checks do **not** establish Fortnox acceptance. The owner must accept the
sandbox invitation, verify its test tenant identity in the portal, enter the
integration secret locally, and complete each Fortnox consent personally.
Then record actual service/client-credentials behavior, user refresh rotation,
company identity and `/me` semantics separately. G04 remains open. Broader S00
and S01 acceptance still requires the other [verification gates](../reference/verification-gates.md).

Primary references: [developer portal](https://www.fortnox.se/developer/developer-portal),
[authorization parameters and PKCE](https://www.fortnox.se/developer/authorization/get-authorization-code),
[client credentials and TenantId](https://www.fortnox.se/developer/authorization/get-access-token-using-client-credentials),
[scope mapping](https://www.fortnox.se/developer/guides-and-good-to-know/scopes),
and [maintained OAuth client example](https://github.com/panva/oauth4webapi/blob/main/examples/oauth.ts).
