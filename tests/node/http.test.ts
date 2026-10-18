import { once } from "node:events";
import { afterAll, beforeAll, describe } from "vitest";
import { createNodeServer } from "../../apps/node/src/server.js";
import { httpContract } from "../shared/http.js";

describe("Node HTTP", () => {
  const server = createNodeServer();
  let endpoint: URL;
  beforeAll(async () => {
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("Missing TCP address");
    endpoint = new URL(`http://127.0.0.1:${address.port}`);
  });
  afterAll(
    () =>
      new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      ),
  );
  httpContract(async (request) => {
    // Keep remote-host rejection in the actual handler rather than rewriting the URL.
    if (new URL(request.url).hostname !== "localhost") {
      const { createFoundationHandler } = await import("@fortnox-mcp/mcp");
      return createFoundationHandler()(request);
    }
    return fetch(
      new Request(new URL(new URL(request.url).pathname, endpoint), request),
    );
  });
});
