import { createNodeServer } from "./server.js";

// No secrets, request payloads or URL parameters enter default logs.
const server = createNodeServer();
const port = Number(process.env.PORT ?? "8787");
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error("Invalid PORT");
server.listen(port, "127.0.0.1", () => console.log("server_started"));
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => server.close());
}
