# Local Fortnox documentation tools

This early S10 slice provides documentation lookup in the main workspace. It
does not connect to a company, execute provider operations or establish hosted
ChatGPT support. Start it explicitly; the normal foundation server and public
Cloudflare installation entry do not enable these tools.

## Run locally

Use the root development versions and install from the root lockfile:

```sh
npm ci --ignore-scripts
npm run dev:docs
```

The Streamable HTTP endpoint is `http://127.0.0.1:8787/mcp`. Connect an MCP client
or Inspector using POST/Streamable HTTP. Browser navigation is not the MCP
protocol. The server binds only to loopback and rejects remote hosts, foreign
Origins and request bodies over the existing 16 KiB transport limit. It has no
remote authentication and must remain local.

Without a specification, the original project guides are available and every
result reports `api_reference.status: "unavailable"`. To add your authorized
OpenAPI input, place it at `vendor-specs/fortnox/openapi.json` (gitignored), or
set `FORTNOX_OPENAPI_PATH` in the local environment/`.env` before startup. An
explicit missing, unreadable, oversized or malformed file fails startup with a
fixed error code; it never silently falls back to guides. Selection of the file
is an operator setting, not a tool argument. The maximum input is 8 MiB.

The dedicated build artifact is `dist/docs-node.js`, started with
`node --env-file-if-exists=.env dist/docs-node.js`. It reads the operator's input
at runtime. Neither the raw file nor its derived index is bundled or written to
disk. Only original guides, code and synthetic test inputs ship in the repo.

## Tools and source attribution

- `search_api_docs({query, kind?, limit?})`: search guides, operation overviews
  and named schemas. Kinds are `guide`, `operation` and `schema`. The default
  limit is five, maximum twenty. Exact identifiers and paths, titles, resource
  tags and body text determine deterministic ranking with reviewed Swedish/
  English aliases. This is keyword search, not semantic or live web search.
- `read_api_doc({doc_id, section?, cursor?})`: read an ID returned by search.
  The default section is `overview`. Each page has at most 6,000 UTF-16 code
  units. Reuse its `continuation` as `cursor` with the same document/section.
  Continuations are bound to the immutable catalog revision and reject stale,
  malformed and cross-document use. They expose only local reference data and
  grant no company authorization.
- `describe_api_operation({operation_id})`: explain the exact operation ID from
  an operation search hit (remove the `operation:` document prefix). Returns
  parameters, request-body media types, schema references/required fields,
  responses, security declarations, reviewed requirements and project coverage.
  Every operation currently has `execution_available: false` and coverage
  `not_implemented`. Describing a POST or a delivery GET remains read-only.

Operation descriptions are capped at 24,000 UTF-16 code units. Individual arrays,
descriptions and schema previews are bounded. `complete: false` explicitly marks
a shortened response and supplies `details.doc_id` and source sections for full
paginated reading: `overview`, `parameters`, `request_body`, `responses` and
`security`. Path parameters are inherited; operation-level parameters override
the same `(in, name)` pair. Request/response content retains its declared media
type, including `*/*`. Schema references point to `schema:<name>` documents;
recursive references are not expanded indefinitely. `required_fields: null`
means that composition/aliasing needs the full schema rather than a fabricated
flat set of requirements.

Tool inputs reject extra properties. Results contain concise text plus validated
structured content, source metadata and API-reference availability/counts.
Guides identify their official reference and actual project review date.
OpenAPI documents identify the input as `user_supplied_openapi`, with SHA-256 and
import time. `acquisition_url` and its review date are unknown, not inferred from
the official reference URL. Importing a file today does not establish that it
was downloaded or reviewed today.

OpenAPI 3.0/3.1 JSON inputs are bounded and validated at import. Local JSON Pointer
references must exist; schema recursion remains as readable `$ref` values.
External references are rejected without a fetch. Missing operation IDs use a
stable `METHOD /path` fallback; duplicate IDs are rejected. Guides and schema
pages are documentation data, including any hostile instructions in descriptions.
The tools do not act on that text, follow source URLs or execute described calls.
Reference-object chains are bounded to 100 steps. Expanded sections have a
conservative 2 MiB serialization budget covering escaping and indentation;
the catalog holds at most 16 Mi UTF-16 code units of section text. Exceeding a
budget fails import. These are implementation bounds, not hosted benchmarks.

`DOC_NOT_FOUND`, `DOC_SECTION_NOT_FOUND`, `INVALID_CURSOR` and `SPEC_UNAVAILABLE`
are distinct read errors. Invalid input is rejected by the MCP input schema;
unexpected internal failures return a fixed `DOCS_UNAVAILABLE` code without raw
source contents, filesystem paths or stack traces.

## Maintenance and remaining boundaries

The original guides cover OAuth, service accounts, refresh, permissions/scopes,
rate limits, parameters, errors, vouchers and invoice-row updates. Their sources
are in the [source register](reference/sources.md). Update their own summaries
and review dates through a PR when the official guidance changes.

## Reviewed operation supplements and source updates

The small typed supplement pack is bound to the exact SHA-256 in the source
lock, plus operation ID, method and path. The initial eight entries cover
company information, accounts, voucher listing/creation and invoice
read/update/email/eprint. Scope names were rechecked against the official
[scope table](https://www.fortnox.se/developer/guides-and-good-to-know/scopes)
on 2026-10-20. This is documentation review, not a live permission test.
Notes distinguish `official_guide`, `snapshot_review` and `project_policy`.

For other operations or a different source hash, reviewed scopes/effects remain
`unknown`; HTTP GET is not an automatic read classification. Declared security
scheme/scopes remain source data separate from reviewed requirements. Absent,
inherited and explicitly empty security declarations are distinct, but none
establish anonymous access, company authorization, granted scopes or licensing.
Hidden/non-public and deprecated source flags are surfaced as warnings.

To review an update:

1. Obtain the authorized input outside Git and record its actual acquisition
   URL/date separately; a re-upload is not an acquisition record.
2. Load the new input locally. Record its hash/counts and compare affected
   operation IDs, methods, paths, parameters, schemas, requirements and effects
   with the previously reviewed input. New hashes can be inspected but cannot
   inherit the old supplement pack.
3. In a PR, update the source lock and pack together with the semantic change
   summary, sources/review dates, affected supplements, synthetic regression
   cases and actual local verification. Do not merely change the hash and carry
   every old review forward. Keep raw/derived source files outside the PR.
4. Change executable operation coverage only in the separate operation PR that
   implements and verifies it. A documentation update enables no API action.

Input hashes identify snapshots, not redistribution permission. The supplied
snapshot's acquisition and distribution rights remain [G05](implementation/S00-source-evidence.md).
Do not commit raw or derived provider content, copy it into test fixtures or
publish a bundle containing it. CI uses independently authored synthetic inputs.

The shared parser, catalog and MCP tools are tested in Node and actual local
workerd. The first operator-facing file loader is Node-only; this change adds no
Worker file-upload/storage route or deployment. Connection diagnostics,
provider authentication and hosted deployment remain separate work.
