// Narrow vanilla adaptation of OpenAI's MCP Apps quickstart bridge. No remote assets.
export const reviewWidget = `<!doctype html>
<html lang="sv"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>S00 – granskning</title><style>
:root{font:16px/1.5 system-ui;color:#152f4b;background:#fff}body{margin:0;padding:24px}main{max-width:720px;margin:auto}
h1{font-size:24px;margin:8px 0}p{margin:8px 0}select,button{font:inherit;padding:10px;border:1px solid #8798aa;border-radius:6px}
button{background:#173e64;color:white;cursor:pointer}button:disabled{opacity:.55;cursor:default}dl{display:grid;grid-template-columns:minmax(100px,1fr) 2fr;gap:6px 16px}dt{color:#506579}dd{margin:0;overflow-wrap:anywhere}table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}th,td{padding:10px 6px;border-bottom:1px solid #dce4eb;text-align:right}th:first-child,td:first-child{text-align:left;overflow-wrap:anywhere}tfoot{font-weight:600}details{font-size:13px;margin:16px 0;overflow-wrap:anywhere}#review{background:#f4f7fa;padding:16px;border-radius:8px}
:focus-visible{outline:3px solid #c96a00;outline-offset:3px}.notice{border-left:4px solid #c96a00;padding-left:12px}
</style><main><label for="language">Språk / Language</label> <select id="language"><option value="sv">Svenska</option><option value="en">English</option></select>
<h1 id="heading">Granska syntetiskt förslag</h1><p class="notice" id="notice">Endast testdata. Ingen bokföring eller Fortnox-åtgärd utförs.</p>
<p id="waiting">Väntar på förslaget från ChatGPT…</p><section id="review" hidden><dl id="summary"></dl><table><thead><tr><th id="accountLabel">Konto</th><th id="debitLabel">Debet</th><th id="creditLabel">Kredit</th></tr></thead><tbody id="rows"></tbody><tfoot id="totals"></tfoot></table><p id="difference"></p><details><summary id="referenceLabel">Testreferens</summary><p id="reference"></p></details></section>
<p id="expiry"></p><button id="approve" disabled>Godkänn testförslaget</button><p id="status" role="status" aria-live="polite"></p></main>
<script type="module">
const byId = id => document.getElementById(id);
const copy = {
sv:{heading:'Granska syntetiskt förslag',notice:'Endast testdata. Ingen bokföring eller Fortnox-åtgärd utförs.',approve:'Godkänn testförslaget',pending:'Väntar på förslaget från ChatGPT…',ready:'Kontrollera företag, rader och totalsummor innan du klickar.',busy:'Skickar testgodkännandet…',done:'Testgodkännandet registrerades en gång. Ingen Fortnox-åtgärd utfördes.',failed:'Godkännandet kunde inte bekräftas. Förbered ett nytt förslag; klicka inte igen.',unsupported:'Klienten saknar en fungerande MCP Apps-brygga. Godkännande är avstängt.',expired:'Förslaget har gått ut. Förbered ett nytt.',expires:'Giltigt till',accountLabel:'Konto',debitLabel:'Debet',creditLabel:'Kredit',referenceLabel:'Testreferens',company:'Företag',year:'Räkenskapsår',date:'Datum',series:'Serie',description:'Beskrivning',currency:'Valuta',receipt:'Underlag',total:'Summa',difference:'Differens'},
en:{heading:'Review synthetic proposal',notice:'Test data only. No bookkeeping or Fortnox action will be performed.',approve:'Approve test proposal',pending:'Waiting for the proposal from ChatGPT…',ready:'Check company, rows and totals before clicking.',busy:'Submitting test approval…',done:'Test approval recorded once. No Fortnox action was performed.',failed:'Approval could not be confirmed. Prepare a new proposal; do not retry.',unsupported:'No working MCP Apps bridge. Approval is disabled.',expired:'Proposal expired. Prepare a new one.',expires:'Expires',accountLabel:'Account',debitLabel:'Debit',creditLabel:'Credit',referenceLabel:'Test reference',company:'Company',year:'Fiscal year',date:'Date',series:'Series',description:'Description',currency:'Currency',receipt:'Receipt',total:'Total',difference:'Difference'}
};
let lang='sv', state='pending', proposal, capability, bridge=false, busy=false, finished=false;
const pending = new Map(); let sequence=0;
function render(){const t=copy[lang];document.documentElement.lang=lang;for(const id of ['heading','notice','approve','accountLabel','debitLabel','creditLabel','referenceLabel'])byId(id).textContent=t[id];
byId('waiting').hidden=Boolean(proposal);byId('waiting').textContent=t.pending;byId('review').hidden=!proposal;
if(proposal){const p=proposal.proposal;byId('summary').replaceChildren();for(const [key,value] of [['company',p.company.name+' ('+p.company.id+')'],['year',p.fiscalYear],['date',p.date],['series',p.series],['description',p.description],['currency',p.currency],['receipt',p.receipt]]){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=t[key];dd.textContent=value;byId('summary').append(dt,dd);}
byId('rows').replaceChildren();for(const row of p.rows){const tr=document.createElement('tr');for(const value of [row.account,row.debit,row.credit]){const td=document.createElement('td');td.textContent=value;tr.append(td);}byId('rows').append(tr);}
byId('totals').replaceChildren();const tr=document.createElement('tr');for(const value of [t.total,p.debitTotal,p.creditTotal]){const td=document.createElement('td');td.textContent=value;tr.append(td);}byId('totals').append(tr);byId('difference').textContent=t.difference+': '+p.difference+' '+p.currency;byId('reference').textContent=proposal.proposalId+' / '+proposal.proposalHash;}
byId('expiry').textContent=capability?t.expires+' '+new Date(capability.expires).toLocaleString(lang):'';
byId('status').textContent=t[state]||'';
byId('approve').disabled=!bridge||!capability||busy||finished||Date.now()>=capability.expires;}
function rpc(method,params){return new Promise((resolve,reject)=>{const id=++sequence;const timer=setTimeout(()=>{pending.delete(id);reject(new Error('timeout'));},15000);pending.set(id,{resolve,reject,timer});parent.postMessage({jsonrpc:'2.0',id,method,params},'*');});}
window.addEventListener('message',event=>{if(event.source!==parent||event.data?.jsonrpc!=='2.0')return;const m=event.data;
if(typeof m.id==='number'&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(new Error('bridge_error')):p.resolve(m.result);return;}
if(m.method==='ui/notifications/tool-result'){
const result=m.params;const data=result?.structuredContent;const privateData=result?._meta?.s00Review;
if(data?.kind==='s00-review-proposal'&&privateData&&typeof privateData.capability==='string'){
proposal=data;capability=privateData;busy=false;finished=false;state='ready';render();}
}});
byId('language').addEventListener('change',event=>{lang=event.target.value==='en'?'en':'sv';render();});
byId('approve').addEventListener('click',async()=>{if(!bridge||!capability||busy||finished)return;
if(Date.now()>=capability.expires){state='expired';finished=true;render();return;}
busy=true;state='busy';render();try{const result=await rpc('tools/call',{name:'commit_synthetic_review',arguments:capability});
state=result?.structuredContent?.accepted===true?'done':'failed';}catch{state='failed';}finally{busy=false;finished=true;capability=undefined;render();}});
try{if(parent===window)throw new Error('no_host');await rpc('ui/initialize',{appInfo:{name:'fortnox-s00-review',version:'0.1.0'},appCapabilities:{},protocolVersion:'2026-01-26'});
bridge=true;parent.postMessage({jsonrpc:'2.0',method:'ui/notifications/initialized',params:{}},'*');render();}catch{state='unsupported';render();}
setInterval(()=>{if(capability&&!busy&&!finished&&Date.now()>=capability.expires){state='expired';finished=true;render();}},1000);
</script></html>`;
