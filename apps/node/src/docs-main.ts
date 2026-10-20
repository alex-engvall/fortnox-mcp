import { DocsError } from "@fortnox-mcp/docs";
import { createDocsServer } from "@fortnox-mcp/mcp";
import { loadDocsCatalog } from "./docs.js";
import { createNodeServer } from "./server.js";

async function main(): Promise<void> {
  try {
    const catalog = await loadDocsCatalog(process.env.FORTNOX_OPENAPI_PATH);
    const port = Number(process.env.PORT ?? "8787");
    if (!Number.isInteger(port) || port < 1 || port > 65535)
      throw new Error("Invalid port");
    const server = createNodeServer(() => createDocsServer(catalog));
    server.listen(port, "127.0.0.1", () => console.log("docs_server_started"));
    for (const signal of ["SIGINT", "SIGTERM"] as const) {
      process.once(signal, () => server.close());
    }
  } catch (error) {
    // Never print parser text, source contents, configured paths or a stack.
    console.error(
      `docs_startup_failed:${error instanceof DocsError ? error.code : "CONFIGURATION_ERROR"}`,
    );
    process.exitCode = 1;
  }
}
await main();
