import { createFoundationHandler } from "@fortnox-mcp/mcp";
import { createAdaptorServer, type ServerType } from "@hono/node-server";

export function createNodeServer(): ServerType {
  return createAdaptorServer({
    fetch: createFoundationHandler(),
    overrideGlobalObjects: false,
  });
}
