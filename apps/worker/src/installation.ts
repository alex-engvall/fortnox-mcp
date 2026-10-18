import { installationPage } from "@fortnox-mcp/ui";

interface InstallationEnv {
  DB?: D1Database;
}

const headers = {
  "cache-control": "no-store",
  "content-security-policy":
    "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
};

async function databaseReady(
  database: D1Database | undefined,
): Promise<boolean> {
  if (!database) return false;
  try {
    // Check the migrated schema without reading or returning any stored rows.
    await database
      .prepare(
        "SELECT owner_id, company_id, id, input_hash, expires_at, state FROM execution_intents WHERE 1 = 0",
      )
      .first();
    return true;
  } catch {
    // Provider errors can contain configuration details; expose only readiness.
    return false;
  }
}

export default {
  async fetch(request: Request, env: InstallationEnv = {}): Promise<Response> {
    const url = new URL(request.url);
    // This deployment is a public infrastructure check, never an MCP gateway.
    if (url.pathname === "/mcp") {
      return new Response(
        "Remote MCP requires authentication; unavailable in this test version.",
        {
          status: 403,
          headers,
        },
      );
    }
    if (!["/", "/setup", "/health"].includes(url.pathname)) {
      return new Response("Not found", { status: 404, headers });
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", {
        status: 405,
        headers: { ...headers, allow: "GET, HEAD" },
      });
    }

    const ready = await databaseReady(env.DB);
    const status = ready ? 200 : 503;
    if (url.pathname === "/health") {
      return new Response(
        request.method === "HEAD"
          ? null
          : JSON.stringify({
              ok: ready,
              runtime: "worker",
              database: ready ? "ready" : "unavailable",
              fortnox: "disabled",
              remoteMcp: "disabled",
            }),
        {
          status,
          headers: {
            ...headers,
            "content-type": "application/json; charset=utf-8",
          },
        },
      );
    }

    const language = url.searchParams.get("lang") === "en" ? "en" : "sv";
    return new Response(
      request.method === "HEAD" ? null : installationPage(ready, language),
      {
        status,
        headers: {
          ...headers,
          "content-type": "text/html; charset=utf-8",
          "content-language": language,
        },
      },
    );
  },
};
