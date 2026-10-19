import { diagnosticWindow, type McpRequestDiagnostic } from "./diagnostics.js";
import { createProbeHandler } from "./http.js";
import { d1ReviewStore } from "./review.js";

interface Env {
  AUTH_DB: D1Database;
  PROBE_ORIGIN: string;
  AUTH_SECRET: string;
  OWNER_ID: string;
  PROBE_PROTOCOL_DIAGNOSTICS?: string;
  PROBE_PROTOCOL_DIAGNOSTICS_UNTIL?: string;
  PROBE_SYNTHETIC_REVIEW?: string;
}
let diagnosticConfig: string | undefined;
let emitDiagnostic: ((event: McpRequestDiagnostic) => void) | undefined;
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (!env.AUTH_SECRET || !env.OWNER_ID || !env.PROBE_ORIGIN)
      return new Response("Probe not provisioned", { status: 503 });
    const key = JSON.stringify([
      env.PROBE_PROTOCOL_DIAGNOSTICS,
      env.PROBE_PROTOCOL_DIAGNOSTICS_UNTIL,
    ]);
    if (key !== diagnosticConfig) {
      diagnosticConfig = key;
      emitDiagnostic = diagnosticWindow(
        env.PROBE_PROTOCOL_DIAGNOSTICS,
        env.PROBE_PROTOCOL_DIAGNOSTICS_UNTIL,
        (event) => console.info({ event: "s00_mcp_request", ...event }),
      );
    }
    return createProbeHandler({
      origin: env.PROBE_ORIGIN,
      secret: env.AUTH_SECRET,
      ownerId: env.OWNER_ID,
      database: env.AUTH_DB,
      ...(env.PROBE_SYNTHETIC_REVIEW === "true"
        ? { review: d1ReviewStore(env.AUTH_DB) }
        : {}),
      ...(emitDiagnostic ? { onMcpRequest: emitDiagnostic } : {}),
    }).fetch(request);
  },
};
