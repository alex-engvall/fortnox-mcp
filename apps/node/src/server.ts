import {
  createFoundationHandler,
  createFoundationServer,
} from "@fortnox-mcp/mcp";
import { createAdaptorServer, type ServerType } from "@hono/node-server";

export function createNodeServer(
  createServer = createFoundationServer,
): ServerType {
  return createAdaptorServer({
    fetch: createFoundationHandler(createServer),
    overrideGlobalObjects: false,
  });
}
