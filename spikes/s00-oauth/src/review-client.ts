// Standard MCP Apps bridge. No host credentials or approval capabilities persist.
export const reviewClientScript = `
const byId = (id) => document.getElementById(id);
const copy = {
  sv: {
    heading: "Granska syntetiskt förslag",
    notice: "Endast testdata. Ingen bokföring eller Fortnox-åtgärd utförs.",
    approve: "Godkänn testförslaget",
    refresh: "Kontrollera status",
    pending: "Väntar på förslaget från ChatGPT…",
    checking: "Kontrollerar förslagets status…",
    ready: "Kontrollera företag, rader och totalsummor innan du klickar.",
    busy: "Skickar testgodkännandet…",
    done: "Testgodkännandet registrerades en gång. Ingen Fortnox-åtgärd utfördes.",
    unavailable:
      "Förslagets status kan inte hämtas. Godkännande är avstängt. Kontrollera status igen.",
    missing:
      "Vyn saknar ett giltigt godkännandebevis. Förbered ett nytt förslag för att granska igen.",
    unknown:
      "Utfallet är okänt. Kontrollera status; skicka inte godkännandet eller ett nytt förslag igen.",
    unsupported:
      "Klienten saknar en fungerande MCP Apps-brygga. Godkännande är avstängt.",
    expired: "Förslaget har gått ut. Förbered ett nytt.",
    expires: "Giltigt till",
    accountLabel: "Konto",
    debitLabel: "Debet",
    creditLabel: "Kredit",
    referenceLabel: "Testreferens",
    company: "Företag",
    year: "Räkenskapsår",
    date: "Datum",
    series: "Serie",
    description: "Beskrivning",
    currency: "Valuta",
    receipt: "Underlag",
    total: "Summa",
    difference: "Differens",
  },
  en: {
    heading: "Review synthetic proposal",
    notice:
      "Test data only. No bookkeeping or Fortnox action will be performed.",
    approve: "Approve test proposal",
    refresh: "Check status",
    pending: "Waiting for the proposal from ChatGPT…",
    checking: "Checking proposal status…",
    ready: "Check company, rows and totals before clicking.",
    busy: "Submitting test approval…",
    done: "Test approval recorded once. No Fortnox action was performed.",
    unavailable:
      "Proposal status is unavailable. Approval is disabled. Check status again.",
    missing:
      "The view has no valid approval capability. Prepare a new proposal to review again.",
    unknown:
      "Outcome unknown. Check status; do not submit the approval or a new proposal again.",
    unsupported: "No working MCP Apps bridge. Approval is disabled.",
    expired: "Proposal expired. Prepare a new one.",
    expires: "Expires",
    accountLabel: "Account",
    debitLabel: "Debit",
    creditLabel: "Credit",
    referenceLabel: "Test reference",
    company: "Company",
    year: "Fiscal year",
    date: "Date",
    series: "Series",
    description: "Description",
    currency: "Currency",
    receipt: "Receipt",
    total: "Total",
    difference: "Difference",
  },
};
let lang = "sv",
  state = "pending",
  proposal,
  capability,
  bridge = false,
  busy = false,
  checking = false,
  attempted = false;
const pending = new Map();
let sequence = 0;
const terminal = () => state === "done" || state === "expired";
const reference = () => ({
  proposalId: proposal.proposalId,
  proposalHash: proposal.proposalHash,
  expires: proposal.expires,
});
function render() {
  const t = copy[lang];
  document.documentElement.lang = lang;
  for (const id of [
    "heading",
    "notice",
    "approve",
    "refresh",
    "accountLabel",
    "debitLabel",
    "creditLabel",
    "referenceLabel",
  ])
    byId(id).textContent = t[id];
  byId("waiting").hidden = Boolean(proposal) || state !== "pending";
  byId("waiting").textContent = t.pending;
  byId("review").hidden = !proposal;
  if (proposal) {
    const p = proposal.proposal;
    byId("summary").replaceChildren();
    for (const [key, value] of [
      ["company", p.company.name + " (" + p.company.id + ")"],
      ["year", p.fiscalYear],
      ["date", p.date],
      ["series", p.series],
      ["description", p.description],
      ["currency", p.currency],
      ["receipt", p.receipt],
    ]) {
      const dt = document.createElement("dt"),
        dd = document.createElement("dd");
      dt.textContent = t[key];
      dd.textContent = value;
      byId("summary").append(dt, dd);
    }
    byId("rows").replaceChildren();
    for (const row of p.rows) {
      const tr = document.createElement("tr");
      for (const value of [row.account, row.debit, row.credit]) {
        const td = document.createElement("td");
        td.textContent = value;
        tr.append(td);
      }
      byId("rows").append(tr);
    }
    byId("totals").replaceChildren();
    const tr = document.createElement("tr");
    for (const value of [t.total, p.debitTotal, p.creditTotal]) {
      const td = document.createElement("td");
      td.textContent = value;
      tr.append(td);
    }
    byId("totals").append(tr);
    byId("difference").textContent =
      t.difference + ": " + p.difference + " " + p.currency;
    byId("reference").textContent =
      proposal.proposalId + " / " + proposal.proposalHash;
    byId("warnings").replaceChildren();
    for (const warning of p.warnings) {
      const item = document.createElement("li");
      item.textContent = warning;
      byId("warnings").append(item);
    }
  }
  byId("expiry").textContent = proposal
    ? t.expires + " " + new Date(proposal.expires).toLocaleString(lang)
    : "";
  byId("status").textContent = t[state] || "";
  byId("approve").disabled =
    state !== "ready" ||
    !bridge ||
    !capability ||
    busy ||
    checking ||
    attempted ||
    Date.now() >= proposal.expires;
  byId("refresh").hidden = !proposal;
  byId("refresh").disabled = !bridge || busy || checking || terminal();
}
function rpc(method, params) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error("timeout"));
    }, 15000);
    pending.set(id, { resolve, reject, timer });
    parent.postMessage({ jsonrpc: "2.0", id, method, params }, "*");
  });
}
function validProposal(data) {
  const p = data?.proposal;
  return (
    data?.kind === "s00-review-proposal" &&
    typeof data.proposalId === "string" &&
    /^[0-9a-f-]{36}$/i.test(data.proposalId) &&
    typeof data.proposalHash === "string" &&
    /^[0-9a-f]{64}$/.test(data.proposalHash) &&
    Number.isSafeInteger(data.expires) &&
    data.expires > 0 &&
    p &&
    p.company &&
    typeof p.company.name === "string" &&
    typeof p.company.id === "string" &&
    [
      "fiscalYear",
      "date",
      "series",
      "description",
      "currency",
      "receipt",
      "debitTotal",
      "creditTotal",
      "difference",
    ].every((k) => typeof p[k] === "string") &&
    Array.isArray(p.rows) &&
    p.rows.length <= 100 &&
    p.rows.every(
      (r) =>
        r &&
        ["account", "debit", "credit"].every((k) => typeof r[k] === "string"),
    ) &&
    Array.isArray(p.warnings) &&
    p.warnings.length <= 100 &&
    p.warnings.every((w) => typeof w === "string")
  );
}
async function reconcile() {
  if (!bridge || !proposal || checking || busy || terminal()) return;
  checking = true;
  if (!attempted) state = "checking";
  render();
  try {
    const result = await rpc("tools/call", {
      name: "read_synthetic_review_status",
      arguments: reference(),
    });
    if (state === "done") return;
    const current = result?.isError ? undefined : result?.structuredContent;
    if (current?.fortnoxEnabled !== false)
      state = attempted ? "unknown" : "unavailable";
    else if (current.status === "consumed") {
      state = "done";
      capability = undefined;
    } else if (state === "expired") return;
    else if (attempted) state = "unknown";
    else if (current.status === "expired") {
      state = "expired";
      capability = undefined;
    } else if (current.status === "prepared") {
      state =
        Date.now() >= proposal.expires
          ? "expired"
          : capability
            ? "ready"
            : "missing";
    } else state = "unavailable";
  } catch {
    if (!terminal()) state = attempted ? "unknown" : "unavailable";
  } finally {
    checking = false;
    render();
  }
}
window.addEventListener("message", (event) => {
  if (event.source !== parent || event.data?.jsonrpc !== "2.0") return;
  const m = event.data;
  if (typeof m.id === "number" && pending.has(m.id)) {
    const p = pending.get(m.id);
    pending.delete(m.id);
    clearTimeout(p.timer);
    m.error ? p.reject(new Error("bridge_error")) : p.resolve(m.result);
    return;
  }
  if (m.method === "ui/notifications/tool-result") {
    const result = m.params;
    const data = result?.structuredContent;
    if (!validProposal(data)) {
      if (!proposal) {
        state = "unavailable";
        render();
      }
      return;
    }
    // Each view belongs to one immutable tool result. Late notifications cannot
    // reset a completed/unknown operation, renew a capability or select another one.
    if (proposal) return;
    proposal = data;
    const privateData = result?._meta?.s00Review;
    if (
      privateData?.proposalId === data.proposalId &&
      privateData.proposalHash === data.proposalHash &&
      privateData.expires === data.expires &&
      typeof privateData.capability === "string" &&
      /^[0-9a-f]{64}$/.test(privateData.capability)
    )
      capability = { ...reference(), capability: privateData.capability };
    state = "checking";
    render();
    void reconcile();
  }
});
byId("language").addEventListener("change", (event) => {
  lang = event.target.value === "en" ? "en" : "sv";
  render();
});
byId("refresh").addEventListener("click", () => {
  void reconcile();
});
byId("approve").addEventListener("click", async () => {
  if (
    state !== "ready" ||
    !bridge ||
    !capability ||
    busy ||
    checking ||
    attempted
  )
    return;
  if (Date.now() >= proposal.expires) {
    state = "expired";
    capability = undefined;
    render();
    return;
  }
  busy = true;
  attempted = true;
  state = "busy";
  const input = capability;
  capability = undefined;
  render();
  try {
    const result = await rpc("tools/call", {
      name: "commit_synthetic_review",
      arguments: input,
    });
    state =
      !result?.isError &&
      result?.structuredContent?.accepted === true &&
      result.structuredContent.fortnoxEnabled === false
        ? "done"
        : "unknown";
  } catch {
    state = "unknown";
  } finally {
    busy = false;
    render();
    if (state === "unknown") void reconcile();
  }
});
try {
  if (parent === window) throw new Error("no_host");
  await rpc("ui/initialize", {
    appInfo: { name: "fortnox-s00-review", version: "0.2.0" },
    appCapabilities: {},
    protocolVersion: "2026-01-26",
  });
  bridge = true;
  parent.postMessage(
    { jsonrpc: "2.0", method: "ui/notifications/initialized", params: {} },
    "*",
  );
  render();
  void reconcile();
  setTimeout(() => {
    if (!proposal) {
      state = "unavailable";
      render();
    }
  }, 15000);
} catch {
  state = "unsupported";
  render();
}
setInterval(() => {
  if (
    proposal &&
    !busy &&
    !attempted &&
    !terminal() &&
    Date.now() >= proposal.expires
  ) {
    state = "expired";
    capability = undefined;
    render();
  }
}, 1000);
render();
`;
