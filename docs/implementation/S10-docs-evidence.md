# S10 local documentation evidence

Implementation starts from merged `main` `8aa0f26` on 2026-10-20. This early
slice is local, explicitly enabled and documentation-only. It closes no
financial/provider or hosted-client gate.

## Implemented first slice

- Portable in-memory OpenAPI parser, original guide catalog, deterministic
  Swedish/English search and bounded, revision-bound reading.
- `search_api_docs` and `read_api_doc`, with strict inputs/outputs and read-only
  annotations; no external fetch, arbitrary file/URL tool or provider execution.
- `npm run dev:docs` and a dedicated built Node entry; private operator-selected
  input is read at startup, never bundled or persisted as a derived index.
- Shared behavior/MCP tests on Node and actual local workerd; independent
  synthetic fixtures and Node file-loader/CLI failure tests.

## First-slice verification

Environment: Linux x64, Node 24.19.0, npm 11.9.0. A clean
`npm ci --ignore-scripts --no-audit --no-fund` reproduced the root lockfile.

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed all three strict configurations |
| `npm run lint` | Passed, 91 files |
| `npm test` | 31 Node/domain + 22 actual local workerd tests passed |
| `npm run build` | All five entries built, including the separate docs entry |
| `npm run test:build` | 4 passed, including docs startup with no bundled source and dynamic code generation disabled |
| Private supplied input | SHA-256 matches the source lock; 405 operations and 672 schemas imported; Swedish voucher/invoice and OAuth lookups returned bounded results |
| Changed Markdown links | 102 relative links resolved |

The private check read the uploaded input directly; it did not copy the file,
its descriptions or a derived index into the repository. Registry warnings
about the pinned SDK's missing sourcemaps do not change the runtime results.
Source license clearance, actual Windows execution, hosted deployment and
ChatGPT acceptance are not established by this slice. The public installation
and normal foundation entry remain separate. See [developer setup](../developer-tools.md).

## Second slice: operation descriptions

The follow-up adds `describe_api_operation` and complete paginated operation
sections. It resolves local parameter/request/response references, preserves
schema recursion and `*/*` bodies, applies parameter inheritance/overrides, and
separates source security declarations from reviewed requirements and actual
coverage. Descriptions are bounded to 24,000 UTF-16 code units, mark truncation
and return section IDs for complete reading. Import expansion is also bounded.

The initial supplement pack contains eight original reviews tied to the exact
source-lock hash, operation ID, method and path. Scope mapping was rechecked
against F06 on 2026-10-20. Invoice update notes explain RowId matching, removed
omitted rows and regenerated IDs; GET email/eprint have external effects. This
is documentation evidence, not live operation acceptance. All executable
operation coverage remains `not_implemented` and `execution_available: false`.

On Linux x64 / Node 24.19.0 / npm 11.9.0:

| Check | Result |
| --- | --- |
| `npm run typecheck` / `npm run lint` | Passed; lint checked 97 files |
| `npm test` | 40 Node/domain + 30 actual local workerd tests passed |
| `npm run build` / `npm run test:build` | Five entries built; 4 artifact tests passed |
| Private supplied input | All 405 descriptions passed the output schema and size bound; 8 matched reviews; 14 correctly reported partial summaries with paginated source detail; 672 schemas retained |
| Documentation | All 322 relative Markdown file links resolved; Git whitespace check passed |

Tests include source-hash/identity mismatch, inherited/empty/absent security,
read-only MCP access to a delivery operation, schema aliases/3.1 booleans and
unions, required fields, complete paginated details, bounded reference
expansion and actual Node CLI loading of a private synthetic file. CI contains
no provider specification or generated provider implementation. Source updates
must review semantic changes and supplements together; a different source hash
is inspectable but receives no old reviews and enables no executable tool.

Windows, hosted Workers/ChatGPT, live provider operations, current company
permissions and source redistribution rights remain outside this evidence.
