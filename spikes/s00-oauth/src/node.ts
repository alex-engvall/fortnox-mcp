import { readFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { createAdaptorServer } from "@hono/node-server";
import { createProbeHandler } from "./http.js";
import { reviewSchema } from "./review.js";
import { sqliteReviewStore } from "./review-sqlite.js";

if (import.meta.main) {
  const config = JSON.parse(await readFile(".data/config.json", "utf8"));
  const database = new DatabaseSync(".data/auth.sqlite");
  if (config.reviewEnabled === true) database.exec(reviewSchema);
  const app = createProbeHandler({
    ...config,
    database,
    ...(config.reviewEnabled === true
      ? { review: sqliteReviewStore(database) }
      : {}),
  });
  createAdaptorServer({
    fetch: app.fetch,
    overrideGlobalObjects: false,
  }).listen(8790, "127.0.0.1", () => {
    console.log("Synthetic OAuth probe listening on http://127.0.0.1:8790");
  });
}
