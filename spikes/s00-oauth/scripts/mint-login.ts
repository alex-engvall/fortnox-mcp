import { randomUUID } from "node:crypto";
import { access, readFile, rename, rm, writeFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { betterAuth } from "better-auth";
import { createAuthEndpoint, isAPIError } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import { oneTimeToken } from "better-auth/plugins/one-time-token";
import { z } from "zod";
import { exportStatements } from "./export-db.js";

const configSchema = z
  .object({
    origin: z.string().url(),
    secret: z.string().min(32),
    ownerId: z.string().min(1),
    operatorCookie: z.string(),
  })
  .passthrough();
export type OperatorConfig = z.infer<typeof configSchema>;

export class OperatorLoginError extends Error {}

// Privileged, local-only operation. Possession of the original private config
// and database is required. This module is never imported by an HTTP/MCP entry.
export async function mintOperatorLogin(
  db: DatabaseSync,
  config: OperatorConfig,
  renewOperatorSession = false,
) {
  // Deliberately omit the OAuth provider plugin: provisioning a login must not
  // reseed resources or change existing review scopes, clients or grants.
  const auth = betterAuth({
    baseURL: new URL(config.origin).origin,
    basePath: "/auth",
    secret: config.secret,
    database: db,
    session: { expiresIn: 86400, cookieCache: { enabled: false } },
    advanced: { useSecureCookies: config.origin.startsWith("https:") },
    logger: { disabled: true },
    plugins: [
      oneTimeToken({
        expiresIn: 5,
        storeToken: "hashed",
        disableClientRequest: true,
        setOttHeaderOnNewSession: true,
      }),
      {
        id: "s00-local-operator",
        endpoints: {
          renewLocalOperatorSession: createAuthEndpoint.serverOnly(
            { method: "POST" },
            async (ctx) => {
              const signedCookie = await ctx.getSignedCookie(
                ctx.context.authCookies.sessionToken.name,
                ctx.context.secret,
              );
              if (!signedCookie) {
                throw new OperatorLoginError(
                  "The original signed operator cookie does not match this config. Restore the original private config; do not replace its secret or reseed the database.",
                );
              }
              const user = await ctx.context.internalAdapter.findUserById(
                config.ownerId,
              );
              if (user?.email !== "owner@example.invalid") {
                throw new OperatorLoginError(
                  "The configured synthetic owner is missing. Use the original matching config and database; do not reseed existing state.",
                );
              }
              const session = await ctx.context.internalAdapter.createSession(
                user.id,
              );
              if (!session)
                throw new OperatorLoginError(
                  "Could not renew the local operator session.",
                );
              // Better Auth generates and signs the cookie and emits the
              // five-minute token through its configured one-time-token hook.
              await setSessionCookie(ctx, { session, user });
              return ctx.json({ renewed: true });
            },
          ),
        },
      },
    ],
  });
  await auth.$context;
  const before = new Set(exportStatements(db));
  let operatorCookie = config.operatorCookie;
  let token: string;
  if (renewOperatorSession) {
    const result = await auth.api.renewLocalOperatorSession({
      returnHeaders: true,
      headers: new Headers({ cookie: config.operatorCookie }),
    });
    token = result.headers.get("set-ott") ?? "";
    operatorCookie = result.headers
      .getSetCookie()
      .map((cookie) => cookie.split(";")[0])
      .join("; ");
    if (!operatorCookie || !token)
      throw new OperatorLoginError(
        "The auth library did not issue the renewed login.",
      );
  } else {
    ({ token } = await auth.api.generateOneTimeToken({
      headers: new Headers({ cookie: operatorCookie }),
    }));
  }
  const inserts = exportStatements(db).filter(
    (statement) =>
      !before.has(statement) &&
      (statement.startsWith('INSERT INTO "verification" ') ||
        (renewOperatorSession &&
          statement.startsWith('INSERT INTO "session" '))),
  );
  const verificationRows = inserts.filter((sql) =>
    sql.startsWith('INSERT INTO "verification" '),
  );
  const sessionRows = inserts.filter((sql) =>
    sql.startsWith('INSERT INTO "session" '),
  );
  if (
    verificationRows.length !== 1 ||
    sessionRows.length !== (renewOperatorSession ? 1 : 0)
  ) {
    throw new OperatorLoginError(
      "Unexpected login export; existing auth data was not exported.",
    );
  }
  return { token, operatorCookie, sql: `${inserts.join(";\n")};\n` };
}

async function writePrivate(path: string, contents: string) {
  const temporary = `${path}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, contents, { mode: 0o600, flag: "wx" });
    await rename(temporary, path);
  } finally {
    await rm(temporary, { force: true });
  }
}

async function main() {
  let db: DatabaseSync | undefined;
  try {
    const args = process.argv.slice(2);
    if (
      args.length > 1 ||
      (args.length === 1 && args[0] !== "--renew-operator-session")
    ) {
      throw new OperatorLoginError(
        "Usage: node --import tsx scripts/mint-login.ts [--renew-operator-session]",
      );
    }
    const config = configSchema.parse(
      JSON.parse(await readFile(".data/config.json", "utf8")),
    );
    // Do not silently create an empty replacement database if private state is missing.
    await access(".data/auth.sqlite");
    db = new DatabaseSync(".data/auth.sqlite");
    const result = await mintOperatorLogin(db, config, args.length === 1);
    await writePrivate(".data/login.sql", result.sql);
    if (args.length === 1) {
      await writePrivate(
        ".data/config.json",
        JSON.stringify({ ...config, operatorCookie: result.operatorCookie }),
      );
    }
    await writePrivate(".data/bootstrap-code.txt", result.token);
    console.log(
      "Fresh five-minute code written privately to .data/bootstrap-code.txt. For local Node/SQLite it is ready. For a Worker, import .data/login.sql into the same isolated D1 database first.",
    );
  } catch (error) {
    if (isAPIError(error) && error.status === "UNAUTHORIZED") {
      console.error(
        "The saved operator session is expired, missing or invalid. No new code was written. On the original operator machine, rerun: node --import tsx scripts/mint-login.ts --renew-operator-session. Keep the original .data/config.json and .data/auth.sqlite; do not run seed.ts again.",
      );
    } else if (error instanceof OperatorLoginError) {
      console.error(error.message);
    } else {
      console.error(
        "Could not prepare a login. Check the original private .data/config.json and .data/auth.sqlite and their file permissions. Do not delete or reseed them. No credential details were printed.",
      );
    }
    process.exitCode = 1;
  } finally {
    db?.close();
  }
}

if (import.meta.main) await main();
