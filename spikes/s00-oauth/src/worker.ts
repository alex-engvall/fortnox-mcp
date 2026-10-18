import { createProbeHandler } from "./http.js";

interface Env {
  AUTH_DB: D1Database;
  PROBE_ORIGIN: string;
  AUTH_SECRET: string;
  OWNER_ID: string;
  PROBE_PROTOCOL_DIAGNOSTICS?: string;
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (!env.AUTH_SECRET || !env.OWNER_ID || !env.PROBE_ORIGIN)
      return new Response("Probe not provisioned", { status: 503 });
    return createProbeHandler({
      origin: env.PROBE_ORIGIN,
      secret: env.AUTH_SECRET,
      ownerId: env.OWNER_ID,
      database: env.AUTH_DB,
      ...(env.PROBE_PROTOCOL_DIAGNOSTICS === "true"
        ? {
            onProtocolNegotiated: (event) =>
              console.info({ event: "s00_protocol_negotiated", ...event }),
            onPublicDiscovery: (event) =>
              console.info({ event: "s00_public_discovery", ...event }),
          }
        : {}),
    }).fetch(request);
  },
};
