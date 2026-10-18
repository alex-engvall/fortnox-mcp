import { reviewClientScript } from "./review-client.js";

// Narrow vanilla adaptation of OpenAI's MCP Apps quickstart bridge. No remote assets.
export const reviewWidget = `<!doctype html>
<html lang="sv"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>S00 – granskning</title><style>
:root{font:16px/1.5 system-ui;color:#152f4b;background:#fff}body{margin:0;padding:24px}main{max-width:720px;margin:auto}
h1{font-size:24px;margin:8px 0}p{margin:8px 0}select,button{font:inherit;padding:10px;border:1px solid #8798aa;border-radius:6px}
button{background:#173e64;color:white;cursor:pointer}button:disabled{opacity:.55;cursor:default}dl{display:grid;grid-template-columns:minmax(100px,1fr) 2fr;gap:6px 16px}dt{color:#506579}dd{margin:0;overflow-wrap:anywhere}table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}th,td{padding:10px 6px;border-bottom:1px solid #dce4eb;text-align:right}th:first-child,td:first-child{text-align:left;overflow-wrap:anywhere}tfoot{font-weight:600}details{font-size:13px;margin:16px 0;overflow-wrap:anywhere}#review{background:#f4f7fa;padding:16px;border-radius:8px}
:focus-visible{outline:3px solid #c96a00;outline-offset:3px}.notice{border-left:4px solid #c96a00;padding-left:12px}#warnings{padding-left:20px}button{margin:4px 8px 4px 0}#status{overflow-wrap:anywhere}@media(max-width:480px){body{padding:16px}dl{grid-template-columns:1fr;gap:0}dd{margin-bottom:8px}th,td{padding:8px 3px;font-size:14px}button,select{max-width:100%}}
</style><main><label for="language">Språk / Language</label> <select id="language"><option value="sv">Svenska</option><option value="en">English</option></select>
<h1 id="heading">Granska syntetiskt förslag</h1><p class="notice" id="notice">Endast testdata. Ingen bokföring eller Fortnox-åtgärd utförs.</p>
<p id="waiting">Väntar på förslaget från ChatGPT…</p><section id="review" hidden><dl id="summary"></dl><table><thead><tr><th id="accountLabel">Konto</th><th id="debitLabel">Debet</th><th id="creditLabel">Kredit</th></tr></thead><tbody id="rows"></tbody><tfoot id="totals"></tfoot></table><p id="difference"></p><ul id="warnings"></ul><details><summary id="referenceLabel">Testreferens</summary><p id="reference"></p></details></section>
<p id="expiry"></p><button id="approve" disabled>Godkänn testförslaget</button><button id="refresh" hidden>Kontrollera status</button><p id="status" role="status" aria-live="polite"></p></main>
<script type="module">${reviewClientScript}</script></html>`;
