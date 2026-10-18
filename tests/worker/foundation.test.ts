import { env } from "cloudflare:workers";
import { beforeEach, describe } from "vitest";
import migration from "../../apps/worker/migrations/0001_execution_intents.sql?raw";
import worker from "../../apps/worker/src/index.js";
import { D1IntentStore } from "../../apps/worker/src/storage.js";
import { httpContract } from "../shared/http.js";
import { intentContract } from "../shared/intents.js";

// This suite runs inside workerd, not a Worker-shaped fetch function in Node.
describe("workerd MCP", () => {
  httpContract(worker.fetch);
});
describe("workerd D1 durable intents", () => {
  beforeEach(async () => {
    await env.DB.exec(migration.replace(/\n/g, " "));
    await env.DB.exec("DELETE FROM execution_intents");
  });
  intentContract(async () => new D1IntentStore(env.DB));
});
