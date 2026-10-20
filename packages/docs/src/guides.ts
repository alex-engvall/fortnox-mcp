// Original project summaries. Provider text and the OpenAPI snapshot are not bundled.
export interface Guide {
  id: string;
  title: string;
  summary: string;
  keywords: string;
  reference: string;
  reviewedOn: string;
  details: string;
}
const developer = "https://www.fortnox.se/developer/";
export const guides: readonly Guide[] = [
  {
    id: "oauth",
    title: "OAuth authorization",
    keywords:
      "oauth authorization autentisering inloggning behörighet permission",
    summary:
      "Keep MCP authorization separate from the Fortnox authorization-code flow.",
    reference: `${developer}authorization`,
    reviewedOn: "2026-10-18",
    details:
      "A Fortnox connection starts with owner-initiated consent. Bind the callback state to the initiating session and verify the returned company through an authenticated provider response. Never treat a model-supplied tenant identifier or a decoded, unverified token as authorization. Fortnox tokens are not MCP access tokens. Consult the linked official authorization guide for current prerequisites.",
  },
  {
    id: "service-accounts",
    title: "Service accounts and client credentials",
    keywords:
      "tjänstekonto service account client credentials tenant systemadministratör",
    summary:
      "Service-account consent precedes client-credentials token issuance for a verified tenant.",
    reference: `${developer}authorization/get-access-token-using-client-credentials`,
    reviewedOn: "2026-10-18",
    details:
      "Each installation uses its own Client ID and secret. Service-account consent requires the applicable Fortnox administrator rights. Verify and retain the authorized numeric TenantId before requesting client-credentials tokens. An upstream service account is not evidence of the human owner's identity or permission to administer this installation.",
  },
  {
    id: "refresh-tokens",
    title: "User token refresh and reconnection",
    keywords:
      "token refresh förnya förnyelse återanslutning användarkonto revoked",
    summary:
      "Serialize rotating refresh-token replacement and reconnect expired or revoked user grants.",
    reference: `${developer}authorization/get-refresh-token`,
    reviewedOn: "2026-10-18",
    details:
      "The user-account path uses rotating refresh tokens. Serialize refresh for each connection and save the replacement atomically. An expired or revoked grant requires owner reconnection. Token reacquisition does not make retrying an uncertain financial write safe. Lifetimes and provider prerequisites must be checked against the current official guide.",
  },
  {
    id: "scopes",
    title: "Scopes, licenses and missing permissions",
    keywords:
      "scope scopes license licens behörighet behörigheter permission permissions saknad saknas missing access",
    summary:
      "A missing scope, product license or provider permission can make an API capability unavailable.",
    reference: `${developer}guides-and-good-to-know/scopes`,
    reviewedOn: "2026-10-20",
    details:
      "Distinguish missing implementation, a missing OAuth scope, product licensing and the provider user's rights. Adding a scope can require renewed consent. A scope in the developer portal does not prove a particular company or user can use the operation. Missing security declarations in an OpenAPI document never establish anonymous access. Report unknown requirements rather than guessing them.",
  },
  {
    id: "rate-limits",
    title: "Rate limits and safe retry",
    keywords: "rate limit anropsgräns anropsgränser begränsning 429 retry",
    summary:
      "Bound requests per client and tenant, and handle provider rate-limit errors.",
    reference: `${developer}guides-and-good-to-know/rate-limits-for-fortnox-api`,
    reviewedOn: "2026-10-18",
    details:
      "The reviewed provider guidance describes 25 requests per five seconds per client/tenant. Share the budget across that tenant's work and use bounded backoff for rate-limit responses. Check actual retry metadata instead of assuming a Retry-After header. Do not automatically resend a mutation after a response is lost; reconcile its outcome first. Recheck current provider limits before capacity planning.",
  },
  {
    id: "parameters",
    title: "Filters, fiscal years and pagination",
    keywords:
      "parameter parametrar sidindelning pagination page limit räkenskapsår financialyear filter",
    summary:
      "Combine endpoint-specific filters with reviewed global parameters and explicit fiscal-year context.",
    reference: `${developer}guides-and-good-to-know/parameters`,
    reviewedOn: "2026-10-20",
    details:
      "The official parameter guide describes filtering, financialyear, financialyeardate, sorting and pagination. These are not all present in every snapshot operation. Review applicability for each endpoint; do not add every global parameter to every operation. Continue through all requested pages or explicitly mark a result partial. Preserve the selected company's fiscal year rather than relying on a provider default.",
  },
  {
    id: "errors",
    title: "Provider errors and diagnostics",
    keywords: "error errors fel felkod diagnostic diagnostik 401 403 429",
    summary:
      "Preserve useful error codes while withholding credentials and unrelated company data.",
    reference: `${developer}guides-and-good-to-know/errors`,
    reviewedOn: "2026-10-18",
    details:
      "Explain validation, authentication, authorization and temporary provider errors separately. Diagnostics must not include tokens, raw request headers or private financial payloads. A 401 may justify one safe token refresh; it does not authorize broader scopes or blindly retrying a write. A successful documentation lookup does not establish that a connection is healthy.",
  },
  {
    id: "vouchers",
    title: "Voucher validation and company context",
    keywords:
      "verifikation verifikationer voucher vouchers bokföring accounting konto accounts",
    summary:
      "Voucher preparation needs an explicit company, fiscal year, valid references and exact balancing.",
    reference: `${developer}guides-and-good-to-know/best-practices/vouchers`,
    reviewedOn: "2026-10-18",
    details:
      "Validate accounts, series, fiscal year and period constraints within the authorized company. Use exact decimal arithmetic and show missing input instead of inventing balancing rows or accounts. A review-required voucher needs the project's verified approval mechanism. Documentation tools only explain operations; they cannot approve, create or book a voucher.",
  },
  {
    id: "invoice-rows",
    title: "Invoice row updates and external effects",
    keywords:
      "faktura fakturor fakturarader invoice invoices rows rowid update uppdatera email eprint",
    summary:
      "Review resulting invoice rows and classify sending by its effect, including GET operations.",
    reference: "https://api.fortnox.se/apidocs",
    reviewedOn: "2026-10-18",
    details:
      "The reviewed invoice-update contract has different row-matching behavior depending on RowId. Reconcile the complete intended row set and verify omission/removal behavior before enabling updates. Do not assume omitted rows remain unchanged. Invoice email and eprint endpoints have external effects even when their HTTP method is GET. Reading this summary grants no permission to execute those operations.",
  },
];
