import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, describe } from "vitest";
import { SqliteIntentStore } from "../../apps/node/src/storage.js";
import { intentContract } from "../shared/intents.js";

const migration = readFileSync(
  new URL(
    "../../apps/worker/migrations/0001_execution_intents.sql",
    import.meta.url,
  ),
  "utf8",
);

describe("SQLite durable intents", () => {
  let directory: string;
  let opened: DatabaseSync[] = [];
  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "fortnox-s01-"));
  });
  afterEach(() => {
    for (const database of opened) database.close();
    opened = [];
    rmSync(directory, { recursive: true, force: true });
  });
  intentContract(async () => {
    const database = new DatabaseSync(join(directory, "intents.sqlite"));
    database.exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;");
    database.exec(migration);
    opened.push(database);
    return new SqliteIntentStore(database);
  });
});
