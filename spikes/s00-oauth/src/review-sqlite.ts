import type { DatabaseSync } from "node:sqlite";
import {
  consumeReviewSql,
  insertReviewSql,
  type ReviewSnapshot,
  type ReviewStore,
  readReviewSql,
  reviewReferenceValues,
  reviewValues,
} from "./review.js";

export function sqliteReviewStore(db: DatabaseSync): ReviewStore {
  return {
    async insert(record, now) {
      db.prepare("DELETE FROM s00_review WHERE expires <= ?").run(now);
      return (
        db
          .prepare(insertReviewSql)
          .run(...reviewValues(record), record.owner, now).changes === 1
      );
    },
    async consume(record, now) {
      return (
        db.prepare(consumeReviewSql).run(...reviewValues(record), now)
          .changes === 1
      );
    },
    async read(reference) {
      return (
        (db.prepare(readReviewSql).get(...reviewReferenceValues(reference)) as
          | ReviewSnapshot
          | undefined) ?? null
      );
    },
  };
}
