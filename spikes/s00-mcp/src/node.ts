import { createAdaptorServer } from '@hono/node-server';
import type { ServerType } from '@hono/node-server';
import { createSpikeHandler } from './http.js';

export function createNodeServer(): ServerType {
  return createAdaptorServer({
    fetch: createSpikeHandler(),
    overrideGlobalObjects: false,
  });
}

if (import.meta.main) {
  const server = createNodeServer();
  server.listen(8787, '127.0.0.1', () => {
    console.log('Experimental synthetic MCP spike: http://127.0.0.1:8787/mcp');
  });
  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => server.close());
  }
}
