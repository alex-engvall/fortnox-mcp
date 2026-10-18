import { readFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { createAdaptorServer } from "@hono/node-server";
import { createProbeHandler } from "./http.js";

if (import.meta.main) {
  const config = JSON.parse(await readFile(".data/config.json", "utf8"));
  const app = createProbeHandler({
    ...config,
    database: new DatabaseSync(".data/auth.sqlite"),
  });
  createAdaptorServer({
    fetch: app.fetch,
    overrideGlobalObjects: false,
  }).listen(8790, "127.0.0.1", () => {
    console.log("Synthetic OAuth probe listening on http://127.0.0.1:8790");
  });
}
