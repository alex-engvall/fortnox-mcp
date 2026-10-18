import { SqlIntentStore } from "../../shared/sql-intents.js";

export class D1IntentStore extends SqlIntentStore {
  constructor(database: D1Database) {
    super({
      async run(sql, bindings) {
        const result = await database
          .prepare(sql)
          .bind(...bindings)
          .run();
        return result.meta.changes;
      },
      async first(sql, bindings) {
        return database
          .prepare(sql)
          .bind(...bindings)
          .first<Record<string, unknown>>();
      },
    });
  }
}
