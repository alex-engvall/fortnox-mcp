import type { DatabaseSync } from "node:sqlite";

// Export only this isolated synthetic auth DB for D1 provisioning/tests.
// The returned SQL contains secrets and MUST remain in ignored private state.
export function exportStatements(db: DatabaseSync): string[] {
  const tables = db
    .prepare(
      "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY rowid",
    )
    .all() as { name: string; sql: string }[];
  const quoted = (value: unknown): string => {
    if (value === null) return "NULL";
    if (typeof value === "number" || typeof value === "bigint")
      return String(value);
    if (typeof value === "string") return `'${value.replaceAll("'", "''")}'`;
    throw new Error("Unsupported export value");
  };
  const identifier = (value: string) => `"${value.replaceAll('"', '""')}"`;
  return [
    ...tables.map((t) => t.sql),
    ...tables.flatMap((t) =>
      db
        .prepare(`SELECT * FROM ${identifier(t.name)}`)
        .all()
        .map(
          (row) =>
            `INSERT INTO ${identifier(t.name)} (${Object.keys(row).map(identifier).join(",")}) VALUES (${Object.values(row).map(quoted).join(",")})`,
        ),
    ),
    ...(
      db
        .prepare(
          "SELECT sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL ORDER BY rowid",
        )
        .all() as { sql: string }[]
    ).map((i) => i.sql),
  ];
}
