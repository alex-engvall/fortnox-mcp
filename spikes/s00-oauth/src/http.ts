import {
  oauthProviderAuthServerMetadata,
  verifyOAuthQueryParams,
} from "@better-auth/oauth-provider";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createProbeAuth, type ProbeConfig } from "./auth.js";
import { page, script, style } from "./pages.js";
import { createProbeServer } from "./server.js";

const authRoutes = new Set([
  "GET /auth/oauth2/authorize",
  "POST /auth/oauth2/token",
  "POST /auth/oauth2/register",
  "POST /auth/oauth2/consent",
  "POST /auth/oauth2/continue",
  "POST /auth/oauth2/revoke",
  "POST /auth/one-time-token/verify",
  "POST /auth/sign-out",
  "GET /auth/get-session",
]);
const browserPosts = new Set([
  "/auth/oauth2/consent",
  "/auth/oauth2/continue",
  "/auth/one-time-token/verify",
  "/auth/sign-out",
]);
const securityHeaders = {
  "cache-control": "no-store",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
  "content-security-policy":
    "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
};

export function createProbeHandler(
  config: ProbeConfig & { testRedirectUri?: string },
) {
  const origin = new URL(config.origin).origin;
  const auth = createProbeAuth(config);
  const challenge = `Bearer resource_metadata="${origin}/.well-known/oauth-protected-resource/mcp", scope="mcp:read"`;
  const respond = (
    body: BodyInit | null,
    status = 200,
    contentType = "text/plain; charset=utf-8",
  ) =>
    new Response(body, {
      status,
      headers: { ...securityHeaders, "content-type": contentType },
    });

  async function handle(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.origin !== origin) return respond("Host forbidden", 403);
    if (
      request.headers.get("origin") &&
      request.headers.get("origin") !== origin
    )
      return respond("Origin forbidden", 403);
    if (request.method === "POST") {
      if (
        browserPosts.has(url.pathname) &&
        request.headers.get("origin") !== origin
      )
        return respond("Origin required", 403);
      // Consume at most 16 KiB, then forward a fresh body to the SDK/library.
      const reader = request.body?.getReader();
      let bytes = 0;
      const chunks: Uint8Array[] = [];
      if (reader)
        for (;;) {
          const next = await reader.read();
          if (next.done) break;
          bytes += next.value.byteLength;
          if (bytes > 16 * 1024) {
            await reader.cancel();
            return respond("Request too large", 413);
          }
          chunks.push(next.value);
        }
      const body = new Uint8Array(bytes);
      let offset = 0;
      for (const chunk of chunks) {
        body.set(chunk, offset);
        offset += chunk.byteLength;
      }
      request = new Request(request.url, {
        method: request.method,
        headers: request.headers,
        body,
      });
    }
    if (
      request.method === "GET" &&
      (url.pathname === "/.well-known/oauth-protected-resource" ||
        url.pathname === "/.well-known/oauth-protected-resource/mcp")
    ) {
      return respond(
        JSON.stringify({
          resource: `${origin}/mcp`,
          authorization_servers: [`${origin}/auth`],
          scopes_supported: ["mcp:read", "offline_access"],
          bearer_methods_supported: ["header"],
        }),
        200,
        "application/json",
      );
    }
    if (
      request.method === "GET" &&
      [
        "/auth/.well-known/oauth-authorization-server",
        "/.well-known/oauth-authorization-server/auth",
        "/.well-known/oauth-authorization-server",
      ].includes(url.pathname)
    ) {
      return oauthProviderAuthServerMetadata(auth)(request);
    }
    if (
      request.method === "GET" &&
      ["/", "/sign-in", "/consent"].includes(url.pathname)
    ) {
      if (
        url.search &&
        !(await verifyOAuthQueryParams(
          url.search.slice(1),
          (
            await auth.$context
          ).secret,
        ))
      )
        return respond("Invalid OAuth query", 400);
      if (url.pathname === "/consent") {
        const session = await auth.api.getSession({ headers: request.headers });
        if (session?.user.id !== config.ownerId)
          return respond("Owner session required", 401);
      }
      return respond(
        page(
          url.pathname === "/"
            ? "home"
            : url.pathname === "/sign-in"
              ? "sign-in"
              : "consent",
        ),
        200,
        "text/html; charset=utf-8",
      );
    }
    if (request.method === "GET" && url.pathname === "/page.js")
      return respond(script, 200, "text/javascript; charset=utf-8");
    if (request.method === "GET" && url.pathname === "/style.css")
      return respond(style, 200, "text/css; charset=utf-8");
    if (authRoutes.has(`${request.method} ${url.pathname}`)) {
      if (url.pathname === "/auth/oauth2/register") {
        let body: { redirect_uris?: unknown };
        try {
          body = await request.clone().json();
        } catch {
          return respond("Invalid registration", 400);
        }
        if (
          !Array.isArray(body.redirect_uris) ||
          !body.redirect_uris.length ||
          body.redirect_uris.length > 4 ||
          !body.redirect_uris.every(
            (uri: unknown) =>
              typeof uri === "string" &&
              (uri ===
                "https://chatgpt.com/connector_platform_oauth_redirect" ||
                uri === config.testRedirectUri),
          )
        ) {
          return respond(
            "Redirect URI not permitted by this test installation",
            400,
          );
        }
      }
      if (
        browserPosts.has(url.pathname) &&
        url.pathname !== "/auth/one-time-token/verify"
      ) {
        const session = await auth.api.getSession({ headers: request.headers });
        if (session?.user.id !== config.ownerId)
          return respond("Owner session required", 401);
      }
      return auth.handler(request);
    }
    if (url.pathname !== "/mcp") return respond("Not found", 404);
    const authorization = request.headers.get("authorization");
    if (!authorization?.match(/^Bearer [^\s]+$/i) || url.search) {
      return new Response("OAuth required", {
        status: 401,
        headers: { ...securityHeaders, "www-authenticate": challenge },
      });
    }
    try {
      await auth.api.verifyProbeToken({
        body: { token: authorization.slice(7) },
      });
    } catch {
      return new Response("Invalid or expired authorization", {
        status: 401,
        headers: { ...securityHeaders, "www-authenticate": challenge },
      });
    }
    if (request.method !== "POST")
      return new Response(null, { status: 405, headers: { Allow: "POST" } });
    const server = createProbeServer();
    const transport = new WebStandardStreamableHTTPServerTransport({
      enableJsonResponse: true,
      maxRequestBodySize: 16 * 1024,
    });
    try {
      await server.connect(transport);
      return await transport.handleRequest(request);
    } finally {
      await server.close();
    }
  }
  return { auth, fetch: handle };
}
