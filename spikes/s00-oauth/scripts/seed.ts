import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { getMigrations } from "better-auth/db/migration";
import { createProbeAuth } from "../src/auth.js";
import { exportStatements } from "./export-db.js";

// Operator-only provisioning. Never print or commit the credentials or DB.
// The five-minute, single-use Better Auth token is delivered outside the model.
const origin = process.argv[2] ?? "http://127.0.0.1:8790";
await mkdir(".data", { recursive: true });
const db = new DatabaseSync(".data/auth.sqlite");
const secret = randomBytes(48).toString("base64url");
const initial = createProbeAuth({ origin, secret, ownerId: "", database: db });
const migrations = await getMigrations(initial.options);
await migrations.runMigrations();
const signup = await initial.api.signUpEmail({
  body: {
    email: "owner@example.invalid",
    name: "Synthetic owner",
    password: randomBytes(48).toString("base64url"),
  },
  returnHeaders: true,
});
const token = signup.headers.get("set-ott");
if (!token)
  throw new Error("The auth library did not issue the bootstrap token");
const config = {
  origin,
  secret,
  ownerId: signup.response.user.id,
  operatorCookie: signup.headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0])
    .join("; "),
};
await writeFile(".data/config.json", JSON.stringify(config), {
  mode: 0o600,
  flag: "wx",
});
await writeFile(".data/bootstrap-code.txt", token, { mode: 0o600, flag: "wx" });
await writeFile(".data/seed.sql", `${exportStatements(db).join(";\n")};\n`, {
  mode: 0o600,
  flag: "wx",
});
await writeFile(
  ".data/secrets.json",
  JSON.stringify({ AUTH_SECRET: secret, OWNER_ID: config.ownerId }),
  { mode: 0o600, flag: "wx" },
);
console.log(
  "Provisioned synthetic owner. Private files: .data/config.json and .data/bootstrap-code.txt (five-minute expiry).",
);
db.close();
