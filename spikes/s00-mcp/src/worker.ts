import { createSpikeHandler } from './http.js';

// Fetch-compatible Worker entry; deliberately restricted to local URLs.
// No bindings, Node built-ins, provider credentials or deployment configuration.
export default { fetch: createSpikeHandler() };
