import type { DatabaseSync } from "node:sqlite";
import { SqlIntentStore } from "../../shared/sql-intents.js";

export class SqliteIntentStore extends SqlIntentStore {
  constructor(database: DatabaseSync) {
    super({
      async run(sql, bindings) {
        return Number(database.prepare(sql).run(...bindings).changes);
      },
      async first(sql, bindings) {
        return database.prepare(sql).get(...bindings) ?? null;
      },
    });
  }
}
