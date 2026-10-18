# Client compatibility and embedded UI

All entries are targets awaiting evidence; no client has been integration-tested in this documentation baseline.

| Client | Priority | Required initial acceptance | Extra capabilities to verify |
| --- | --- | --- | --- |
| ChatGPT | First | Remote connection/auth, company discovery, read/write tools, accurate approval annotations | Embedded manual-voucher review, multi-file ingress, file output, UI-only tool boundary |
| Claude | Next | MCP connection/auth and core tools | Actual deployed-client MCP Apps/file support; no assumed feature parity |
| Codex/other MCP clients | Compatibility target | Standard schema/results and allowed core operations | Transport, file and approval capabilities per client/version |

## Protocol and transport

Remote installations expose authenticated Streamable HTTP. Verify supported protocol revisions and backwards compatibility with the actual target client. The MCP `2026-07-28` revision changes core interaction patterns; do not copy legacy session/SSE examples uncritically. If multiple protocol eras are supported, test both, share domain authorization and document lifecycle differences.

ChatGPT needs an accessible remote endpoint or a documented supported connection mechanism; a stdio process or localhost port is not, by itself, a ChatGPT connection. S00 records plan/account/workspace prerequisites from current official guidance rather than promising all features on every account.

## UI

Use standard MCP Apps metadata where supported: a `ui://` resource and `_meta.ui.resourceUri`; restrict commit tools with `_meta.ui.visibility` as appropriate. Keep UI input separate from model-visible results when sensitive capability material is involved. Follow the [approval contract](approval.md); visibility alone is not proof of human consent.

The review view must work with keyboard navigation, readable labels, explicit company identity and responsive layouts. Show per-item status and actionable errors. Do not hide a changed total, silently preselect a different company or make a declined action recur automatically.

User-facing UI and help should support Swedish and English. Tool identifiers/developer schemas are English; values and original document text retain their source language. Do not rely on a translated label to identify a company or account.

## File compatibility

Record each client's actual file input/output schema, supported formats, expiry and size limits. Verify a two-receipt upload, expired file URL, failed download, returned receipt and voucher link. Do not claim that simply pasting an image into any MCP client makes its bytes available to the server.

## Capability negotiation and degradation

Read-only tools can remain available when UI/files are unsupported. Disable only the affected action with an actionable explanation. `review_required` manual writes must remain blocked when the verified review path is absent. A client may not select `client_managed` for the owner.

## Evidence to record

For each tested release: server commit, SDK/protocol, client name/version or hosted test date, plan/workspace prerequisites, auth method, supported UI/files, test company, synthetic scenarios, results and unresolved limitations. Do not infer conformance from successful tool discovery alone.
