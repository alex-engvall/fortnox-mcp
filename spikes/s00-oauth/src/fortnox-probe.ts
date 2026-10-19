import * as oauth from "oauth4webapi";

// Operator-only G04 probe. This is not an MCP tool or a production connector.
export const FORTNOX_SCOPES = "companyinformation profile";
export const FORTNOX_REDIRECT = "http://localhost:8789/callback";
const authorizationServer: oauth.AuthorizationServer = {
  issuer: "https://apps.fortnox.se",
  authorization_endpoint: "https://apps.fortnox.se/oauth-v1/auth",
  token_endpoint: "https://apps.fortnox.se/oauth-v1/token",
  code_challenge_methods_supported: ["S256"],
};

export type FortnoxMode = "service" | "user";
export interface FortnoxConfig {
  clientId: string;
  clientSecret: string;
  testTenantId: string;
}
export interface FortnoxFlow {
  mode: FortnoxMode;
  state: string;
  verifier: string;
  expiresAt: number;
  consumed: boolean;
  authorizationUrl: string;
}
interface IdentityEvidence {
  status: number;
  sysAdmin: boolean | null;
  fields: string[];
}
export interface FortnoxEvidence {
  mode: FortnoxMode;
  tenantMatched: true;
  expiresIn: number | null;
  refreshIssued: boolean;
  identity: IdentityEvidence;
  clientCredentials?: {
    tenantMatched: true;
    expiresIn: number | null;
    identity: IdentityEvidence;
  };
  refresh?: { rotated: true; tenantMatched: true; identity: IdentityEvidence };
}

export class FortnoxProbeError extends Error {
  constructor(
    readonly stage: string,
    readonly status?: number,
  ) {
    super(`Fortnox probe stopped: ${stage}`);
  }
}

export function validateFortnoxConfig(config: FortnoxConfig): void {
  if (
    !/^[A-Za-z0-9_-]{5,128}$/.test(config.clientId) ||
    config.clientSecret.length < 8 ||
    config.clientSecret.length > 1024 ||
    !/^[1-9][0-9]{0,14}$/.test(config.testTenantId)
  ) {
    throw new FortnoxProbeError("invalid_configuration");
  }
}

export async function createFortnoxFlow(
  config: FortnoxConfig,
  mode: FortnoxMode,
  now = Date.now(),
): Promise<FortnoxFlow> {
  validateFortnoxConfig(config);
  const verifier = oauth.generateRandomCodeVerifier();
  const state = oauth.generateRandomState();
  const url = new URL(authorizationServer.authorization_endpoint as string);
  url.search = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: FORTNOX_REDIRECT,
    response_type: "code",
    scope: FORTNOX_SCOPES,
    access_type: "offline",
    state,
    code_challenge: await oauth.calculatePKCECodeChallenge(verifier),
    code_challenge_method: "S256",
    ...(mode === "service" ? { account_type: "service" } : {}),
  }).toString();
  return {
    mode,
    state,
    verifier,
    expiresAt: now + 10 * 60_000,
    consumed: false,
    authorizationUrl: url.href,
  };
}

type Fetcher = typeof fetch;
type OAuthFetcher = NonNullable<
  oauth.ProtectedResourceRequestOptions[typeof oauth.customFetch]
>;

// Every upstream request is pinned to one token endpoint or two read endpoints.
// Reject redirects, bound response size/time, and never propagate raw errors.
function boundedFetch(implementation: Fetcher): OAuthFetcher {
  return async (input, init) => {
    const url = new URL(input);
    const method = init.method;
    const body = init.body;
    if (
      body != null &&
      typeof body !== "string" &&
      !(body instanceof URLSearchParams)
    ) {
      throw new FortnoxProbeError("request_not_allowed");
    }
    const allowed =
      (url.href === authorizationServer.token_endpoint && method === "POST") ||
      (url.origin === "https://api.fortnox.se" &&
        ["/3/companyinformation", "/3/me"].includes(url.pathname) &&
        !url.search &&
        method === "GET");
    if (!allowed) throw new FortnoxProbeError("request_not_allowed");
    let response: Response;
    try {
      response = await implementation(input, {
        method,
        headers: init.headers,
        body,
        redirect: "error",
        signal: AbortSignal.timeout(15_000),
      });
    } catch {
      throw new FortnoxProbeError("network_error");
    }
    const reader = response.body?.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    if (reader) {
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > 65_536) {
            await reader.cancel();
            throw new FortnoxProbeError("response_too_large");
          }
          chunks.push(value);
        }
      } catch (error) {
        if (error instanceof FortnoxProbeError) throw error;
        throw new FortnoxProbeError("response_read_error");
      } finally {
        reader.releaseLock();
      }
    }
    const data = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      data.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return new Response(size ? data : null, {
      status: response.status,
      headers: response.headers,
      statusText: response.statusText,
    });
  };
}

function checkScopes(tokens: oauth.TokenEndpointResponse): void {
  if (
    tokens.scope &&
    tokens.scope.split(/\s+/).sort().join(" ") !== FORTNOX_SCOPES
  ) {
    throw new FortnoxProbeError("unexpected_scopes");
  }
}

async function companyMatches(
  token: string,
  tenant: string,
  upstream: OAuthFetcher,
): Promise<true> {
  const response = await oauth.protectedResourceRequest(
    token,
    "GET",
    new URL("https://api.fortnox.se/3/companyinformation"),
    new Headers({ Accept: "application/json" }),
    undefined,
    { [oauth.customFetch]: upstream },
  );
  if (!response.ok) {
    throw new FortnoxProbeError("company_information", response.status);
  }
  const body = (await response.json()) as {
    CompanyInformation?: { DatabaseNumber?: unknown };
  };
  if (String(body.CompanyInformation?.DatabaseNumber) !== tenant) {
    throw new FortnoxProbeError("test_tenant_mismatch");
  }
  return true;
}

async function identity(
  token: string,
  upstream: OAuthFetcher,
): Promise<IdentityEvidence> {
  const response = await oauth.protectedResourceRequest(
    token,
    "GET",
    new URL("https://api.fortnox.se/3/me"),
    new Headers({ Accept: "application/json" }),
    undefined,
    { [oauth.customFetch]: upstream },
  );
  // A service account may not have a human profile. Record that, not an owner role.
  if (!response.ok) {
    return { status: response.status, sysAdmin: null, fields: [] };
  }
  const body = (await response.json()) as Record<string, unknown>;
  const profile = (body.Me ?? body.me ?? body) as Record<string, unknown>;
  return {
    status: response.status,
    sysAdmin: typeof profile.SysAdmin === "boolean" ? profile.SysAdmin : null,
    fields: ["SysAdmin", "UserName", "UserId", "Name", "Email"].filter((key) =>
      Object.hasOwn(profile, key),
    ),
  };
}

export async function finishFortnoxFlow(
  config: FortnoxConfig,
  flow: FortnoxFlow,
  callback: URL,
  implementation: Fetcher = fetch,
  now = Date.now(),
): Promise<FortnoxEvidence> {
  validateFortnoxConfig(config);
  if (
    flow.consumed ||
    now >= flow.expiresAt ||
    callback.origin + callback.pathname !== FORTNOX_REDIRECT
  ) {
    throw new FortnoxProbeError("invalid_or_expired_flow");
  }
  const client: oauth.Client = { client_id: config.clientId };
  let params: URLSearchParams;
  try {
    params = oauth.validateAuthResponse(
      authorizationServer,
      client,
      callback,
      flow.state,
    );
  } catch {
    throw new FortnoxProbeError("invalid_authorization_response");
  }
  // Claim synchronously before I/O: callback replay/concurrency never exchanges twice.
  flow.consumed = true;
  const upstream = boundedFetch(implementation);
  const clientAuth = oauth.ClientSecretBasic(config.clientSecret);
  const options = { [oauth.customFetch]: upstream };
  try {
    const response = await oauth.authorizationCodeGrantRequest(
      authorizationServer,
      client,
      clientAuth,
      params,
      FORTNOX_REDIRECT,
      flow.verifier,
      options,
    );
    const tokens = await oauth.processAuthorizationCodeResponse(
      authorizationServer,
      client,
      response,
    );
    checkScopes(tokens);
    await companyMatches(tokens.access_token, config.testTenantId, upstream);
    const evidence: FortnoxEvidence = {
      mode: flow.mode,
      tenantMatched: true,
      expiresIn: tokens.expires_in ?? null,
      refreshIssued: Boolean(tokens.refresh_token),
      identity: await identity(tokens.access_token, upstream),
    };
    if (flow.mode === "service") {
      const grant = await oauth.clientCredentialsGrantRequest(
        authorizationServer,
        client,
        clientAuth,
        { scope: FORTNOX_SCOPES },
        { ...options, headers: { TenantId: config.testTenantId } },
      );
      const replacement = await oauth.processClientCredentialsResponse(
        authorizationServer,
        client,
        grant,
      );
      checkScopes(replacement);
      evidence.clientCredentials = {
        tenantMatched: await companyMatches(
          replacement.access_token,
          config.testTenantId,
          upstream,
        ),
        expiresIn: replacement.expires_in ?? null,
        identity: await identity(replacement.access_token, upstream),
      };
    } else {
      if (!tokens.refresh_token) {
        throw new FortnoxProbeError("refresh_token_missing");
      }
      const grant = await oauth.refreshTokenGrantRequest(
        authorizationServer,
        client,
        clientAuth,
        tokens.refresh_token,
        options,
      );
      const replacement = await oauth.processRefreshTokenResponse(
        authorizationServer,
        client,
        grant,
      );
      checkScopes(replacement);
      if (
        !replacement.refresh_token ||
        replacement.refresh_token === tokens.refresh_token
      ) {
        throw new FortnoxProbeError("refresh_not_rotated");
      }
      evidence.refresh = {
        rotated: true,
        tenantMatched: await companyMatches(
          replacement.access_token,
          config.testTenantId,
          upstream,
        ),
        identity: await identity(replacement.access_token, upstream),
      };
    }
    return evidence;
  } catch (error) {
    if (error instanceof FortnoxProbeError) throw error;
    // oauth errors can contain token responses. Never return/log the raw object.
    throw new FortnoxProbeError("provider_response_rejected");
  }
}
