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

`DOC_NOT_FOUND`, `DOC_SECTION_NOT_FOUND`, `INVALID_CURSOR` and `SPEC_UNAVAILABLE`
are distinct read errors. Invalid input is rejected by the MCP input schema;
unexpected internal failures return a fixed `DOCS_UNAVAILABLE` code without raw
source contents, filesystem paths or stack traces.

## Maintenance and remaining boundaries

The original guides cover OAuth, service accounts, refresh, permissions/scopes,
rate limits, parameters, errors, vouchers and invoice-row updates. Their sources
are in the [source register](reference/sources.md). Update their own summaries
and review dates through a PR when the official guidance changes.

Input hashes identify snapshots, not redistribution permission. The supplied
snapshot's acquisition and distribution rights remain [G05](implementation/S00-source-evidence.md).
Do not commit raw or derived provider content, copy it into test fixtures or
publish a bundle containing it. CI uses independently authored synthetic inputs.

The shared parser, catalog and MCP tools are tested in Node and actual local
workerd. The first operator-facing file loader is Node-only; this change adds no
Worker file-upload/storage route or deployment. The second S10 PR adds detailed
operation descriptions and reviewed source-specific supplements. Connection
diagnostics, provider authentication and hosted deployment remain separate work.
