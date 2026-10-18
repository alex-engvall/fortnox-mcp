import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { convertV4MiniflareOptions, Miniflare } from "miniflare";
import { expect, it } from "vitest";
import { SqliteIntentStore } from "../../apps/node/src/storage.js";
import { D1IntentStore } from "../../apps/worker/src/storage.js";

const migration = readFileSync(
  new URL(
    "../../apps/worker/migrations/0001_execution_intents.sql",
    import.meta.url,
  ),
  "utf8",
);
const context = { ownerId: "owner_a", companyId: "company_a" };
const input = {
  id: "intent_restart",
  inputHash: "a".repeat(64),
  expiresAt: 100,
};

it("SQLite retains an uncertain outcome after closing and reopening the database", async () => {
  const directory = mkdtempSync(join(tmpdir(), "fortnox-sqlite-restart-"));
  let database: DatabaseSync | undefined;
  try {
    const file = join(directory, "intents.sqlite");
    database = new DatabaseSync(file);
    database.exec(migration);
    const first = new SqliteIntentStore(database);
    await first.prepare(context, input);
    await first.transition(context, input.id, "prepared", "submitting", 1);
    await first.transition(
      context,
      input.id,
      "submitting",
      "outcome_unknown",
      2,
    );
    database.close();
    database = new DatabaseSync(file);
    const reopened = new SqliteIntentStore(database);
    expect((await reopened.get(context, input.id))?.state).toBe(
      "outcome_unknown",
    );
    await expect(
      reopened.transition(
        context,
        input.id,
        "outcome_unknown",
        "submitting",
        200,
      ),
    ).rejects.toThrow("VALIDATION_FAILED");
  } finally {
    database?.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

it("D1 retains an uncertain outcome across workerd process restarts", async () => {
  const directory = mkdtempSync(join(tmpdir(), "fortnox-d1-restart-"));
  const options = convertV4MiniflareOptions({
    name: "s01-storage-test",
    modules: true,
    script: "export default { fetch() { return new Response('synthetic'); } };",
    compatibilityDate: "2026-10-18",
    d1Databases: { DB: "s01-storage-test" },
    resourcePersistencePath: directory,
  });
  let runtime = new Miniflare(options);
  try {
    const database = await runtime.getD1Database("DB");
    await database.exec(migration.replace(/\n/g, " "));
    const first = new D1IntentStore(database);
    await first.prepare(context, input);
    await first.transition(context, input.id, "prepared", "submitting", 1);
    await first.transition(
      context,
      input.id,
      "submitting",
      "outcome_unknown",
      2,
    );
    await runtime.dispose();
    runtime = new Miniflare(options);
    const reopened = new D1IntentStore(await runtime.getD1Database("DB"));
    expect((await reopened.get(context, input.id))?.state).toBe(
      "outcome_unknown",
    );
    await expect(
      reopened.transition(
        context,
        input.id,
        "outcome_unknown",
        "submitting",
        200,
      ),
    ).rejects.toThrow("VALIDATION_FAILED");
  } finally {
    await runtime.dispose();
    rmSync(directory, { recursive: true, force: true });
  }
}, 20_000);
