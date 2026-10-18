import { createFoundationHandler } from "@fortnox-mcp/mcp";

// Local, synthetic fixture only. Remote hosts remain blocked until verified OAuth exists.
export default { fetch: createFoundationHandler() };
