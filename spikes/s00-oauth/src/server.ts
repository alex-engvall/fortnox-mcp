import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CfWorkerJsonSchemaValidator } from "@modelcontextprotocol/sdk/validation/cfworker";
import { z } from "zod";

export function createProbeServer() {
  const server = new McpServer(
    { name: "fortnox-mcp-s00-oauth", version: "0.0.0-experimental" },
    { jsonSchemaValidator: new CfWorkerJsonSchemaValidator() },
  );
  server.registerTool(
    "read_synthetic_status",
    {
      title: "Read OAuth test status",
      description:
        "Read a fixed synthetic OAuth test fixture. No Fortnox data or financial operations.",
      inputSchema: z.object({}).strict(),
      outputSchema: z
        .object({
          dataset: z.literal("s00-oauth"),
          authenticated: z.literal(true),
          fortnoxEnabled: z.literal(false),
        })
        .strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        securitySchemes: [
          { type: "oauth2", scopes: ["mcp:read", "offline_access"] },
        ],
      },
    },
    () => {
      const result = {
        dataset: "s00-oauth" as const,
        authenticated: true as const,
        fortnoxEnabled: false as const,
      };
      return {
        content: [{ type: "text", text: JSON.stringify(result) }],
        structuredContent: result,
      };
    },
  );
  return server;
}
