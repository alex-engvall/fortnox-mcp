import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CfWorkerJsonSchemaValidator } from '@modelcontextprotocol/sdk/validation/cfworker';
import { readSyntheticStatus, statusInput, statusOutput } from './status.js';

// The producer seam lets offline tests verify rejection of invalid output.
export function createSpikeServer(readStatus: () => unknown = readSyntheticStatus): McpServer {
  const server = new McpServer(
    { name: 'fortnox-mcp-s00-spike', version: '0.0.0-experimental' },
    { jsonSchemaValidator: new CfWorkerJsonSchemaValidator() },
  );

  server.registerTool(
    'read_synthetic_status',
    {
      title: 'Read synthetic S00 status',
      description: 'Returns a fixed synthetic fixture. No company data, network access or side effects.',
      inputSchema: statusInput,
      outputSchema: statusOutput,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    () => {
      const parsed = statusOutput.safeParse(readStatus());
      if (!parsed.success) {
        // Never serialize an invalid producer result, even into an error message.
        throw new Error('Synthetic output failed validation');
      }
      return {
        content: [{ type: 'text', text: JSON.stringify(parsed.data) }],
        structuredContent: parsed.data,
      };
    },
  );
  return server;
}
