import { readFile, writeFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { createProbeAuth } from "../src/auth.js";
import { exportStatements } from "./export-db.js";

// Operator-only: mint a fresh library-managed five-minute login code while the
// original 24-hour operator session is valid. No code is printed to stdout.
const config = JSON.parse(await readFile(".data/config.json", "utf8")) as {
  origin: string;
  secret: string;
  ownerId: string;
  operatorCookie: string;
};
const db = new DatabaseSync(".data/auth.sqlite");
const auth = createProbeAuth({ ...config, database: db });
const before = new Set(exportStatements(db));
const { token } = await auth.api.generateOneTimeToken({
  headers: new Headers({ cookie: config.operatorCookie }),
});
const inserts = exportStatements(db).filter(
  (statement) =>
    !before.has(statement) &&
    statement.startsWith('INSERT INTO "verification" '),
);
if (inserts.length !== 1)
  throw new Error("Expected exactly one new verification row");
await writeFile(".data/bootstrap-code.txt", token, { mode: 0o600 });
await writeFile(".data/login.sql", `${inserts[0]};\n`, { mode: 0o600 });
console.log(
  "Fresh login code written privately; import .data/login.sql into the isolated D1 database. Code expires in five minutes.",
);
db.close();
