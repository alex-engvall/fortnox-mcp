import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const [accountId, databaseId] = process.argv.slice(2);
if (
  !accountId?.match(/^[a-f0-9]{32}$/) ||
  !databaseId?.match(/^[a-f0-9-]{36}$/)
)
  throw new Error(
    "Pass the selected test account ID and the new isolated D1 database ID",
  );
const config = JSON.parse(await readFile(".data/config.json", "utf8")) as {
  origin: string;
};
await writeFile(
  ".data/wrangler.json",
  JSON.stringify(
    {
      name: "fortnox-mcp-s00-oauth",
      account_id: accountId,
      main: resolve("src/worker.ts"),
      compatibility_date: "2026-10-18",
      compatibility_flags: ["nodejs_compat"],
      workers_dev: true,
      preview_urls: false,
      observability: { enabled: false },
      vars: { PROBE_ORIGIN: config.origin },
      d1_databases: [
        {
          binding: "AUTH_DB",
          database_name: "fortnox-mcp-s00-oauth",
          database_id: databaseId,
        },
      ],
    },
    null,
    2,
  ),
  { mode: 0o600, flag: "wx" },
);
console.log(
  "Wrote ignored .data/wrangler.json. Existing installation resources are not referenced.",
);
