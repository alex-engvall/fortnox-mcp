import { mkdir, readFile, writeFile } from "node:fs/promises";

// Package only a verified endpoint and declarative OAuth metadata, never secrets.
const { origin } = JSON.parse(await readFile(".data/config.json", "utf8")) as {
  origin: string;
};
const probe = await fetch(`${origin}/mcp`);
if (
  probe.status !== 401 ||
  !probe.headers.get("www-authenticate")?.includes("resource_metadata=")
)
  throw new Error("Live endpoint did not advertise OAuth");
const directory = ".data/fortnox-mcp-s00-oauth";
await mkdir(directory, { recursive: true });
await writeFile(
  `${directory}/plugin.json`,
  JSON.stringify(
    {
      $schema: "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
      name: "fortnox-mcp-s00-oauth",
      version: "0.1.0",
      description:
        "Private S00 OAuth feasibility test. One authenticated synthetic read tool; no Fortnox data.",
      author: { name: "Alexander Engvall" },
      license: "AGPL-3.0-only",
      extensions: {
        "com.openai": {
          interface: {
            displayName: "Fortnox MCP – S00 OAuth-test",
            shortDescription: "OAuth-test med syntetiska data",
            longDescription:
              "Privat anslutningsprov med en fast syntetisk teststatus. Inga Fortnox-uppgifter eller ekonomiska åtgärder.",
            developerName: "Alexander Engvall",
            category: "Productivity",
            capabilities: [],
          },
        },
      },
    },
    null,
    2,
  ),
);
await writeFile(
  `${directory}/mcp.json`,
  JSON.stringify(
    {
      $schema: "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
      mcpServers: {
        "s00-oauth": {
          type: "streamable-http",
          url: `${origin}/mcp`,
          extensions: {
            "com.openai": {
              auth: {
                type: "oauth",
                client: { mode: "dcr" },
                baseScopes: ["mcp:read", "offline_access"],
                defaultScopes: ["mcp:read", "offline_access"],
                oidcEnabled: false,
              },
            },
          },
        },
      },
    },
    null,
    2,
  ),
);
console.log(
  "Wrote the private plugin package under ignored .data/fortnox-mcp-s00-oauth. It contains no credentials.",
);
