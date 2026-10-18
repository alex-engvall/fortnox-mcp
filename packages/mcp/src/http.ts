import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createFoundationServer } from "./server.js";

const loopbackHosts = new Set(["127.0.0.1", "localhost", "[::1]"]);

export function createFoundationHandler(
  createServer = createFoundationServer,
): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    // This unauthenticated spike must stay local. Remote auth belongs to G01.
    if (!loopbackHosts.has(url.hostname)) {
      return new Response("Local development only", { status: 403 });
    }
    const origin = request.headers.get("origin");
    if (origin !== null && origin !== url.origin) {
      return new Response("Origin forbidden", { status: 403 });
    }
    if (url.pathname !== "/mcp") {
      return new Response("Not found", { status: 404 });
    }
    // JSON responses are a supported Streamable HTTP mode. No persistent SSE,
    // sessions, replay store or DELETE lifecycle is implemented in this slice.
    if (request.method !== "POST") {
      return new Response("Method not allowed", {
        status: 405,
        headers: { Allow: "POST" },
      });
    }

    const server = createServer();
    const transport = new WebStandardStreamableHTTPServerTransport({
      enableJsonResponse: true,
      maxRequestBodySize: 16 * 1024,
      // Omitting sessionIdGenerator selects the SDK's stateless mode.
    });
    try {
      await server.connect(transport);
      return await transport.handleRequest(request);
    } finally {
      // Safe because JSON mode resolves only after the complete result is ready.
      await server.close();
    }
  };
}
