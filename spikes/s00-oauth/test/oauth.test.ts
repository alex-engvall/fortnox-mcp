import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { getMigrations } from "better-auth/db/migration";
import { convertV4MiniflareOptions, Miniflare } from "miniflare";
import { exportStatements } from "../scripts/export-db.js";
import { createProbeAuth } from "../src/auth.js";
import {
  createProbeHandler,
  type ProtocolNegotiation,
  type PublicDiscoveryDiagnostic,
} from "../src/http.js";

const origin = "https://probe.example.invalid";
const callback = "https://client.example.invalid/callback";

interface Payload {
  client_id: string;
  url: string;
  resource: string;
  issuer: string;
  code_challenge_methods_supported: string[];
  authorization_response_iss_parameter_supported: boolean;
  grant_types_supported: string[];
  token_type: string;
  refresh_token: string;
  access_token: string;
  expires_in: number;
  result: { structuredContent: unknown };
}
const data = (r: Response) => r.json() as Promise<Payload>;

function required<T>(value: T | null | undefined): T {
  assert.ok(
    value !== null && value !== undefined,
    "required protocol field is present",
  );
  return value;
}

async function fixture(worker = false) {
  const db = new DatabaseSync(":memory:");
  const secret = randomBytes(48).toString("base64url");
  const bootstrap = createProbeAuth({
    origin,
    secret,
    ownerId: "",
    database: db,
  });
  await (await getMigrations(bootstrap.options)).runMigrations();
  const seeded = await bootstrap.api.signUpEmail({
    body: {
      email: "owner@example.invalid",
      name: "Synthetic owner",
      password: randomBytes(48).toString("base64url"),
    },
    returnHeaders: true,
  });
  const negotiations: ProtocolNegotiation[] = [];
  const discoveryDiagnostics: PublicDiscoveryDiagnostic[] = [];
  const app = createProbeHandler({
    origin,
    secret,
    ownerId: seeded.response.user.id,
    database: db,
    testRedirectUri: callback,
    onProtocolNegotiated: (event) => {
      negotiations.push(event);
    },
    onPublicDiscovery: (event) => {
      discoveryDiagnostics.push(event);
    },
  });
  let mf: Miniflare | undefined;
  if (worker) {
    mf = new Miniflare(
      convertV4MiniflareOptions({
        name: "s00-oauth-test",
        modules: true,
        scriptPath: "dist/worker.js",
        compatibilityDate: "2026-10-18",
        compatibilityFlags: ["nodejs_compat"],
        d1Databases: ["AUTH_DB"],
        bindings: {
          PROBE_ORIGIN: origin,
          AUTH_SECRET: secret,
          OWNER_ID: seeded.response.user.id,
        },
      }),
    );
    const d1 = await mf.getD1Database("AUTH_DB");
    for (const statement of exportStatements(db))
      await d1.prepare(statement).run();
  }
  async function req(
    path: string,
    body?: object | URLSearchParams,
    cookie?: string,
    extra: Record<string, string> = {},
  ) {
    const headers = new Headers({
      ...(path.startsWith("/auth/oauth2/authorize")
        ? { accept: "text/html", "sec-fetch-mode": "navigate" }
        : {}),
      ...extra,
      ...(cookie ? { cookie } : {}),
    });
    if (body) {
      headers.set(
        "content-type",
        body instanceof URLSearchParams
          ? "application/x-www-form-urlencoded"
          : "application/json",
      );
    }
    const request = new Request(`${origin}${path}`, {
      method: body ? "POST" : "GET",
      headers,
      ...(body
        ? {
            body: body instanceof URLSearchParams ? body : JSON.stringify(body),
          }
        : {}),
    });
    return mf
      ? ((await mf.dispatchFetch(request.url, {
          method: request.method,
          headers: Object.fromEntries(headers),
          body: body ? await request.text() : undefined,
          redirect: "manual",
        })) as unknown as Response)
      : app.fetch(request);
  }
  const token = seeded.headers.get("set-ott");
  assert.ok(token, "bootstrap token issued");
  const login = await req("/auth/one-time-token/verify", { token }, undefined, {
    origin,
  });
  assert.equal(login.status, 200, "bootstrap login succeeds");
  const cookie = login.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
  assert.ok(cookie, "session cookie issued");
  async function register() {
    const r = await req("/auth/oauth2/register", {
      client_name: "Synthetic test client",
      redirect_uris: [callback],
      token_endpoint_auth_method: "none",
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      scope: "mcp:read offline_access",
    });
    assert.equal(r.status, 201, "DCR succeeds");
    return (await data(r)).client_id;
  }
  async function authorization(
    clientId: string,
    overrides: Record<string, string> = {},
  ) {
    const verifier = randomBytes(48).toString("base64url");
    const q = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: callback,
      scope: "mcp:read offline_access",
      state: "synthetic-state",
      code_challenge: createHash("sha256").update(verifier).digest("base64url"),
      code_challenge_method: "S256",
      resource: `${origin}/mcp`,
      ...overrides,
    });
    const r = await req(`/auth/oauth2/authorize?${q}`, undefined, cookie);
    return { r, verifier };
  }
  async function grant() {
    const clientId = await register();
    const { r, verifier } = await authorization(clientId);
    assert.equal(r.status, 302, "authorization redirects to consent");
    const consent = new URL(required(r.headers.get("location")), origin);
    assert.equal(consent.pathname, "/consent");
    const accepted = await req(
      "/auth/oauth2/consent",
      { accept: true, oauth_query: consent.search.slice(1) },
      cookie,
      { origin },
    );
    assert.equal(accepted.status, 200, "consent succeeds");
    const result = await data(accepted);
    const redirect = new URL(result.url);
    assert.equal(
      redirect.origin + redirect.pathname,
      callback,
      "exact callback",
    );
    assert.equal(redirect.searchParams.get("state"), "synthetic-state");
    assert.equal(
      redirect.searchParams.get("iss"),
      `${origin}/auth`,
      "RFC 9207 issuer included",
    );
    const code = required(redirect.searchParams.get("code"));
    const exchangeBody = {
      grant_type: "authorization_code",
      client_id: clientId,
      redirect_uri: callback,
      resource: `${origin}/mcp`,
      code,
      code_verifier: verifier,
    };
    return { clientId, exchangeBody };
  }
  async function exchange(body: Record<string, string>) {
    return req("/auth/oauth2/token", new URLSearchParams(body));
  }
  async function call(accessToken: string) {
    return req(
      "/mcp",
      {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: { name: "read_synthetic_status", arguments: {} },
      },
      undefined,
      {
        authorization: `Bearer ${accessToken}`,
        accept: "application/json, text/event-stream",
        "mcp-protocol-version": "2025-11-25",
      },
    );
  }
  return {
    db,
    app,
    req,
    cookie,
    token,
    register,
    authorization,
    grant,
    exchange,
    call,
    negotiations,
    discoveryDiagnostics,
    close: async () => {
      await mf?.dispose();
      db.close();
    },
  };
}

test("operator diagnostics expose only SDK protocol versions, not private RPC fields", async () => {
  const f = await fixture();
  try {
    const request = {
      jsonrpc: "2.0",
      id: "synthetic-private-request-id",
      method: "initialize",
      params: {
        protocolVersion: "2026-07-28",
        capabilities: {},
        clientInfo: { name: "synthetic-private-client-name", version: "1" },
      },
    };
    const accept = { accept: "application/json, text/event-stream" };
    assert.equal((await f.req("/mcp", request, undefined, accept)).status, 200);
    assert.deepEqual(f.negotiations, [
      { requestedProtocol: "2026-07-28", negotiatedProtocol: "2025-11-25" },
    ]);
    assert.equal(
      (
        await f.req("/mcp", request, undefined, {
          ...accept,
          authorization: "Bearer invalid",
        })
      ).status,
      401,
    );
    assert.equal(
      f.negotiations.length,
      1,
      "bad supplied credentials do not fall back to public metadata",
    );
    const { exchangeBody } = await f.grant();
    const tokens = await data(await f.exchange(exchangeBody));
    const response = await f.req("/mcp", request, undefined, {
      authorization: `Bearer ${tokens.access_token}`,
      accept: "application/json, text/event-stream",
    });
    assert.equal(response.status, 200);
    assert.deepEqual(f.negotiations, [
      { requestedProtocol: "2026-07-28", negotiatedProtocol: "2025-11-25" },
      { requestedProtocol: "2026-07-28", negotiatedProtocol: "2025-11-25" },
    ]);
    assert.equal((await f.call(tokens.access_token)).status, 200);
    assert.equal(
      f.negotiations.length,
      2,
      "ordinary calls do not enter diagnostic output",
    );
  } finally {
    await f.close();
  }
});

test("anonymous discovery exposes only fixed schemas and never a tool call or private resource", async () => {
  const f = await fixture();
  try {
    assert.equal(
      (await f.req("/mcp", { method: "synthetic-private-value" })).status,
      401,
    );
    assert.deepEqual(
      f.discoveryDiagnostics,
      [{ methods: ["other"], jsonRpc2: [false] }],
      "diagnostic suppresses unknown input rather than logging it",
    );
    const headers = { accept: "application/json, text/event-stream" };
    const list = await f.req(
      "/mcp",
      { jsonrpc: "2.0", id: 1, method: "tools/list" },
      undefined,
      headers,
    );
    assert.equal(list.status, 200);
    const body = (await list.json()) as {
      result: {
        tools: { name: string; _meta: { securitySchemes: unknown } }[];
      };
    };
    assert.deepEqual(
      body.result.tools.map((tool) => tool.name),
      ["read_synthetic_status"],
    );
    assert.deepEqual(body.result.tools[0]?._meta.securitySchemes, [
      { type: "oauth2", scopes: ["mcp:read"] },
    ]);
    for (const method of [
      "tools/call",
      "resources/read",
      "resources/list",
      "prompts/get",
      "unknown",
    ]) {
      const rpc = {
        jsonrpc: "2.0",
        id: 2,
        method,
        params: {
          name: "read_synthetic_status",
          arguments: {},
          confirmed: true,
        },
      };
      assert.equal(
        (await f.req("/mcp", rpc, undefined, headers)).status,
        401,
        method,
      );
      assert.equal(
        (
          await f.req(
            "/mcp",
            [{ jsonrpc: "2.0", id: 1, method: "tools/list" }, rpc],
            undefined,
            headers,
          )
        ).status,
        401,
        `mixed batch ${method}`,
      );
    }
    assert.equal(
      (
        await f.req(
          "/mcp?access_token=invalid",
          { jsonrpc: "2.0", id: 1, method: "tools/list" },
          undefined,
          headers,
        )
      ).status,
      401,
    );
  } finally {
    await f.close();
  }
});

test("metadata and all unauthenticated MCP methods advertise OAuth; no signup/admin bypass", async () => {
  const f = await fixture();
  try {
    const r = await f.req("/mcp");
    assert.equal(r.status, 401);
    assert.match(
      required(r.headers.get("www-authenticate")),
      /resource_metadata=/,
    );
    const prm = await data(
      await f.req("/.well-known/oauth-protected-resource/mcp"),
    );
    assert.equal(prm.resource, `${origin}/mcp`);
    const as = await data(
      await f.req("/.well-known/oauth-authorization-server/auth"),
    );
    assert.equal(as.issuer, `${origin}/auth`);
    assert.deepEqual(as.code_challenge_methods_supported, ["S256"]);
    assert.equal(as.authorization_response_iss_parameter_supported, true);
    assert.deepEqual(as.grant_types_supported, [
      "authorization_code",
      "refresh_token",
    ]);
    assert.equal((await f.req("/auth/sign-up/email", {})).status, 404);
    assert.equal((await f.req("/auth/one-time-token/generate")).status, 404);
    assert.equal((await f.req("/auth/verify-probe-token", {})).status, 404);
  } finally {
    f.db.close();
  }
});

test("single-use bootstrap; browser mutations require same-origin owner session", async () => {
  const f = await fixture();
  try {
    assert.ok(
      (
        await f.req(
          "/auth/one-time-token/verify",
          { token: f.token },
          undefined,
          { origin },
        )
      ).status >= 400,
      "bootstrap replay rejected",
    );
    assert.equal(
      (await f.req("/auth/oauth2/consent", { accept: true }, f.cookie)).status,
      403,
    );
    assert.equal(
      (
        await f.req("/auth/oauth2/consent", { accept: true }, f.cookie, {
          origin: "https://foreign.invalid",
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await f.req("/auth/oauth2/consent", { accept: true }, undefined, {
          origin,
        })
      ).status,
      401,
    );
    assert.equal(
      (
        await f.req("/auth/oauth2/register", {
          redirect_uris: ["https://foreign.invalid/callback"],
        })
      ).status,
      400,
    );
  } finally {
    f.db.close();
  }
});

test("DCR → signed consent → PKCE → authenticated MCP tool → immediate logout denial", async () => {
  const f = await fixture();
  try {
    const g = await f.grant();
    const r = await f.exchange(g.exchangeBody);
    assert.equal(r.status, 200, "code exchange");
    const tokens = await data(r);
    assert.equal(tokens.token_type, "Bearer");
    assert.ok(tokens.refresh_token);
    assert.equal(tokens.expires_in, 300);
    const call = await f.call(tokens.access_token);
    assert.equal(call.status, 200, "protected tool succeeds");
    const result = await data(call);
    assert.deepEqual(result.result.structuredContent, {
      dataset: "s00-oauth",
      authenticated: true,
      fortnoxEnabled: false,
    });
    assert.ok(
      (await f.exchange(g.exchangeBody)).status >= 400,
      "code cannot be reused",
    );
    assert.equal(
      (await f.req("/auth/sign-out", {}, f.cookie, { origin })).status,
      200,
    );
    assert.equal(
      (await f.call(tokens.access_token)).status,
      401,
      "logout invalidates existing token immediately",
    );
  } finally {
    f.db.close();
  }
});

test("wrong verifier, resource, redirect, unknown token, and query bearer are rejected", async () => {
  const f = await fixture();
  try {
    const g = await f.grant();
    assert.ok(
      (
        await f.exchange({
          ...g.exchangeBody,
          code_verifier: randomBytes(48).toString("base64url"),
        })
      ).status >= 400,
      "wrong PKCE verifier",
    );
    const g2 = await f.grant();
    assert.ok(
      (
        await f.exchange({
          ...g2.exchangeBody,
          resource: "https://foreign.invalid/mcp",
        })
      ).status >= 400,
      "wrong resource",
    );
    const client = await f.register();
    const { r } = await f.authorization(client, {
      redirect_uri: `${callback}-other`,
    });
    if (r.status === 302) {
      const target = new URL(required(r.headers.get("location")), origin);
      assert.equal(target.origin, origin, "bad redirect stays at issuer");
      assert.equal(target.searchParams.has("code"), false);
    } else assert.ok(r.status >= 400, "unregistered redirect");
    assert.equal((await f.call("synthetic-invalid")).status, 401);
    assert.equal(
      (await f.req("/mcp?access_token=synthetic-invalid")).status,
      401,
    );
  } finally {
    f.db.close();
  }
});

test("refresh rotates, revocation stops the access token and refresh family", async () => {
  const f = await fixture();
  try {
    const g = await f.grant();
    const tokens = await data(await f.exchange(g.exchangeBody));
    const refresh = {
      grant_type: "refresh_token",
      client_id: g.clientId,
      refresh_token: tokens.refresh_token,
      resource: `${origin}/mcp`,
    };
    const r = await f.exchange(refresh);
    assert.equal(r.status, 200, "refresh succeeds");
    const rotated = await data(r);
    assert.notEqual(
      rotated.refresh_token,
      tokens.refresh_token,
      "refresh token rotated",
    );
    const revoked = await f.req(
      "/auth/oauth2/revoke",
      new URLSearchParams({
        client_id: g.clientId,
        token: rotated.refresh_token,
        token_type_hint: "refresh_token",
      }),
    );
    assert.equal(revoked.status, 200, "revocation");
    assert.equal(
      (await f.call(rotated.access_token)).status,
      401,
      "access token linked to revoked refresh rejected",
    );
    assert.ok(
      (await f.exchange({ ...refresh, refresh_token: rotated.refresh_token }))
        .status >= 400,
      "revoked refresh denied",
    );
  } finally {
    f.db.close();
  }
});

test("expired codes/tokens, another installation, oversized body, and modified signed consent fail closed", async (t) => {
  const f = await fixture();
  try {
    const g = await f.grant();
    t.mock.timers.enable({ apis: ["Date"], now: Date.now() + 601000 });
    assert.ok(
      (await f.exchange(g.exchangeBody)).status >= 400,
      "expired authorization code",
    );
    t.mock.timers.reset();
    const g2 = await f.grant();
    const tokens = await data(await f.exchange(g2.exchangeBody));
    const otherDb = new DatabaseSync(":memory:");
    const other = createProbeHandler({
      origin,
      secret: randomBytes(48).toString("base64url"),
      ownerId: "another-owner",
      database: otherDb,
    });
    const isolated = await other.fetch(
      new Request(`${origin}/mcp`, {
        headers: { authorization: `Bearer ${tokens.access_token}` },
      }),
    );
    assert.equal(
      isolated.status,
      401,
      "other installation does not know the token",
    );
    otherDb.close();
    t.mock.timers.enable({ apis: ["Date"], now: Date.now() + 301000 });
    assert.equal(
      (await f.call(tokens.access_token)).status,
      401,
      "expired access token",
    );
    t.mock.timers.reset();
    assert.equal(
      (await f.req("/mcp", { padding: "x".repeat(17000) })).status,
      413,
    );
    const client = await f.register();
    const { r } = await f.authorization(client);
    const signed = new URL(required(r.headers.get("location")), origin);
    signed.searchParams.set("scope", "mcp:write");
    assert.equal(
      (await f.req(`/consent${signed.search}`, undefined, f.cookie)).status,
      400,
      "signed scopes cannot be altered",
    );
  } finally {
    t.mock.timers.reset();
    f.db.close();
  }
});

test("bootstrap replay is atomic and signed login continues to consent without an auto-grant", async () => {
  const f = await fixture();
  try {
    const one = await f.app.auth.api.generateOneTimeToken({
      headers: new Headers({ cookie: f.cookie }),
    });
    const client = await f.register();
    const verifier = randomBytes(48).toString("base64url");
    const q = new URLSearchParams({
      response_type: "code",
      client_id: client,
      redirect_uri: callback,
      scope: "mcp:read",
      code_challenge: createHash("sha256").update(verifier).digest("base64url"),
      code_challenge_method: "S256",
      resource: `${origin}/mcp`,
      state: "login-fixture",
    });
    const start = await f.req(`/auth/oauth2/authorize?${q}`);
    const login = new URL(required(start.headers.get("location")), origin);
    assert.equal(login.pathname, "/sign-in");
    const responses = await Promise.all(
      [1, 2].map(() =>
        f.req(
          "/auth/one-time-token/verify",
          { token: one.token, oauth_query: login.search.slice(1) },
          undefined,
          { origin },
        ),
      ),
    );
    assert.equal(
      responses.filter((r) => r.status === 200).length,
      1,
      "one token creates one usable login",
    );
    const success = required(responses.find((r) => r.status === 200));
    const cookie = success.headers
      .getSetCookie()
      .map((c) => c.split(";")[0])
      .join("; ");
    const resumed = await f.req(
      `/auth/oauth2/authorize${login.search}`,
      undefined,
      cookie,
    );
    assert.equal(resumed.status, 302);
    const target = new URL(required(resumed.headers.get("location")), origin);
    assert.equal(target.pathname, "/consent");
    assert.equal(
      target.searchParams.has("code"),
      false,
      "human consent is still required",
    );
  } finally {
    f.db.close();
  }
});

test("workerd/D1: one-time login, discovery, PKCE, MCP, refresh, revocation and bootstrap replay", async () => {
  const f = await fixture(true);
  try {
    const as = await data(
      await f.req("/.well-known/oauth-authorization-server/auth"),
    );
    assert.equal(as.issuer, `${origin}/auth`);
    assert.ok(
      (
        await f.req(
          "/auth/one-time-token/verify",
          { token: f.token },
          undefined,
          { origin },
        )
      ).status >= 400,
      "D1 rejects bootstrap replay",
    );
    // Remote adapter intentionally allows only ChatGPT's exact redirect.
    const registered = await f.req("/auth/oauth2/register", {
      redirect_uris: ["https://chatgpt.com/connector_platform_oauth_redirect"],
      token_endpoint_auth_method: "none",
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      scope: "mcp:read offline_access",
    });
    assert.equal(registered.status, 201);
    const clientId = (await data(registered)).client_id;
    const verifier = randomBytes(48).toString("base64url");
    const q = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: "https://chatgpt.com/connector_platform_oauth_redirect",
      scope: "mcp:read offline_access",
      state: "synthetic-state",
      code_challenge: createHash("sha256").update(verifier).digest("base64url"),
      code_challenge_method: "S256",
      resource: `${origin}/mcp`,
    });
    const authorized = await f.req(
      `/auth/oauth2/authorize?${q}`,
      undefined,
      f.cookie,
    );
    // Miniflare's dispatch client is a fetch request; the provider returns a
    // JSON redirect for fetch, and an HTTP redirect for browser navigation.
    assert.ok([200, 302].includes(authorized.status), "authorization redirect");
    const consentUrl = new URL(
      authorized.status === 302
        ? required(authorized.headers.get("location"))
        : (await data(authorized)).url,
      origin,
    );
    assert.equal(consentUrl.origin, origin);
    assert.equal(consentUrl.pathname, "/consent");
    assert.equal(
      (await f.req(`/consent${consentUrl.search}`, undefined, f.cookie)).status,
      200,
      "D1 serves the verified signed consent page",
    );
    const accepted = await f.req(
      "/auth/oauth2/consent",
      { accept: true, oauth_query: consentUrl.search.slice(1) },
      f.cookie,
      { origin },
    );
    assert.equal(accepted.status, 200);
    const redirect = new URL((await data(accepted)).url);
    assert.equal(redirect.searchParams.get("iss"), `${origin}/auth`);
    const exchange = {
      grant_type: "authorization_code",
      client_id: clientId,
      redirect_uri: "https://chatgpt.com/connector_platform_oauth_redirect",
      resource: `${origin}/mcp`,
      code: required(redirect.searchParams.get("code")),
      code_verifier: verifier,
    };
    const response = await f.exchange(exchange);
    assert.equal(response.status, 200);
    const tokens = await data(response);
    assert.equal((await f.call(tokens.access_token)).status, 200);
    const refreshed = await f.exchange({
      grant_type: "refresh_token",
      client_id: clientId,
      refresh_token: tokens.refresh_token,
      resource: `${origin}/mcp`,
    });
    assert.equal(refreshed.status, 200);
    const rotated = await data(refreshed);
    const revoked = await f.req(
      "/auth/oauth2/revoke",
      new URLSearchParams({
        client_id: clientId,
        token: rotated.refresh_token,
        token_type_hint: "refresh_token",
      }),
    );
    assert.equal(revoked.status, 200);
    assert.equal((await f.call(rotated.access_token)).status, 401);
  } finally {
    await f.close();
  }
});
