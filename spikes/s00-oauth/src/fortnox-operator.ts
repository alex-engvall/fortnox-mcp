import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import * as oauth from "oauth4webapi";
import {
  createFortnoxFlow,
  type FortnoxConfig,
  type FortnoxEvidence,
  type FortnoxFlow,
  type FortnoxMode,
  FortnoxProbeError,
  finishFortnoxFlow,
} from "./fortnox-probe.js";

const origin = "http://localhost:8789";
const config = JSON.parse(
  await readFile(".data/fortnox-operator.json", "utf8"),
) as { clientId: string; testTenantId: string; testName: string };
if (
  !/^[A-Za-z0-9_-]{5,128}$/.test(config.clientId) ||
  !/^[1-9][0-9]{0,14}$/.test(config.testTenantId) ||
  config.testName.length > 100
) {
  throw new Error("Invalid local test configuration");
}

// This local single-operator process has no remote MCP/admin API. Secrets exist
// only in process memory and are discarded at shutdown; nothing reads the browser.
const session = oauth.generateRandomState();
const csrf = oauth.generateRandomState();
const cookie = `s00_fortnox=${session}`;
const expiresAt = Date.now() + 30 * 60_000;
let clientSecret = "";
let flow: FortnoxFlow | undefined;
let busy = false;
let failure = "";
const evidence: FortnoxEvidence[] = [];

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const page = (body: string) =>
  `<!doctype html><html lang="sv"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>S00 – Fortnox testanslutning</title><style>body{font:18px system-ui;background:#f4f6f9;color:#18375c;margin:3rem auto;max-width:780px;padding:1.5rem}main{background:white;padding:2rem;border-radius:16px}h1{font-size:1.6rem}label{display:block;margin:1.2rem 0 .4rem}input{font:inherit;width:90%;padding:.6rem}button{font:inherit;background:#203f68;color:white;border:0;border-radius:5px;padding:.7rem 1rem;margin:.8rem .4rem .2rem 0}pre{white-space:pre-wrap;font-size:.9rem}a{color:#203f68}</style><main><h1>S00 – Fortnox testanslutning</h1>${body}</main></html>`;
function home() {
  return page(`<p>Vald testmiljö: <strong>${escapeHtml(config.testName)}</strong></p>
<p>Endast Företagsinformation och Profil. Inga bokförings- eller betalningsåtgärder.</p>
${failure ? `<p role="alert">Testet stoppades: ${escapeHtml(failure)}. Inga automatiska återförsök görs.</p>` : ""}
${busy ? "<p>Kontrollerar anslutningen…</p>" : ""}
${
  flow && !flow.consumed && Date.now() < flow.expiresAt
    ? "<p>Slutför det pågående godkännandet i Fortnox innan du startar ett nytt test.</p>"
    : `<form method="post" action="/start">
<input type="hidden" name="csrf" value="${csrf}">
${clientSecret ? "<p>Klientuppgiften finns tillfälligt i det här lokala testets minne.</p>" : `<label for="secret">Client Secret för MCP S00 – privat test</label><input id="secret" name="secret" type="password" autocomplete="off" required maxlength="1024"><p>Klistra in själv från Fortnox. Uppgiften sparas inte på disk och visas inte i chatten.</p>`}
<button name="mode" value="service">Testa servicekonto</button>
<button name="mode" value="user">Testa användarkonto</button></form>`
}
${evidence.length ? `<h2>Testresultat</h2><pre>${escapeHtml(JSON.stringify(evidence, null, 2))}</pre>` : ""}
<form method="post" action="/stop"><input type="hidden" name="csrf" value="${csrf}"><button>Avsluta och rensa testets minne</button></form>
<p>Lokalt experiment. Stängs automatiskt efter 30 minuter.</p>`);
}

const server = createServer(async (request, response) => {
  const respond = (status: number, body: string, location?: string) => {
    response.writeHead(status, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Security-Policy":
        "default-src 'none'; style-src 'unsafe-inline'; form-action 'self' https://apps.fortnox.se; frame-ancestors 'none'; base-uri 'none'",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      ...(location ? { Location: location } : {}),
    });
    response.end(body);
  };
  try {
    if (request.headers.host !== "localhost:8789" || Date.now() >= expiresAt) {
      respond(403, "Lokalt test är inte tillgängligt.");
      return;
    }
    const url = new URL(request.url ?? "/", origin);
    if (url.origin !== origin) {
      respond(403, "Ogiltig adress.");
      return;
    }
    const hasSession = request.headers.cookie?.split(/;\s*/).includes(cookie);
    if (request.method === "GET" && url.pathname === "/") {
      response.setHeader(
        "Set-Cookie",
        `${cookie}; HttpOnly; SameSite=Lax; Path=/; Max-Age=1800`,
      );
      respond(200, home());
      return;
    }
    if (!hasSession) {
      respond(403, "Öppna testets startsida först.");
      return;
    }
    if (
      request.method === "POST" &&
      ["/start", "/stop"].includes(url.pathname)
    ) {
      if (
        request.headers.origin !== origin ||
        !request.headers["content-type"]?.startsWith(
          "application/x-www-form-urlencoded",
        )
      ) {
        respond(403, "Ogiltig förfrågan.");
        return;
      }
      let body = "";
      for await (const chunk of request) {
        body += chunk.toString();
        if (Buffer.byteLength(body) > 8192) {
          respond(413, "För stor förfrågan.");
          return;
        }
      }
      const form = new URLSearchParams(body);
      if (form.getAll("csrf").length !== 1 || form.get("csrf") !== csrf) {
        respond(403, "Ogiltig förfrågan.");
        return;
      }
      if (url.pathname === "/stop") {
        if (busy) {
          respond(409, page("<p>Vänta tills testet är klart.</p>"));
          return;
        }
        clientSecret = "";
        flow = undefined;
        respond(
          200,
          page(
            "<p>Testet är avslutat. Klientuppgiften finns inte längre i testets minne.</p>",
          ),
        );
        server.close();
        return;
      }
      if (busy || (flow && !flow.consumed && Date.now() < flow.expiresAt)) {
        respond(409, page("<p>Ett test pågår redan.</p>"));
        return;
      }
      const mode = form.get("mode");
      if (mode !== "service" && mode !== "user") {
        respond(400, "Välj kontotyp.");
        return;
      }
      busy = true;
      try {
        const candidate: FortnoxConfig = {
          ...config,
          clientSecret: clientSecret || form.get("secret") || "",
        };
        flow = await createFortnoxFlow(candidate, mode as FortnoxMode);
        clientSecret = candidate.clientSecret;
        failure = "";
        respond(303, "", flow.authorizationUrl);
      } finally {
        busy = false;
      }
      return;
    }
    if (request.method === "GET" && url.pathname === "/callback") {
      if (!flow || busy) {
        respond(409, "Inget tillgängligt test.");
        return;
      }
      busy = true;
      try {
        const result = await finishFortnoxFlow(
          { ...config, clientSecret },
          flow,
          url,
        );
        evidence.push(result);
        await mkdir(".data", { recursive: true });
        await writeFile(
          ".data/fortnox-evidence.json",
          JSON.stringify(evidence, null, 2),
          { mode: 0o600 },
        );
        console.log(
          JSON.stringify({ event: "fortnox_probe_completed", ...result }),
        );
      } catch (error) {
        failure =
          error instanceof FortnoxProbeError
            ? `${error.stage}${error.status ? ` (HTTP ${error.status})` : ""}`
            : "test_failed";
        flow = undefined;
        console.log(
          JSON.stringify({ event: "fortnox_probe_stopped", stage: failure }),
        );
      } finally {
        busy = false;
      }
      respond(303, "", "/");
      return;
    }
    respond(404, "Sidan finns inte.");
  } catch {
    respond(400, "Testet kunde inte behandla förfrågan.");
  }
});

server.requestTimeout = 30_000;
server.headersTimeout = 10_000;
server.listen(8789, "127.0.0.1", () => {
  console.log("Local Fortnox test ready at http://localhost:8789 (30 minutes)");
});
const timeout = setTimeout(() => {
  clientSecret = "";
  flow = undefined;
  server.closeAllConnections();
  server.close();
}, 30 * 60_000);
timeout.unref();
