# S00 local operator session recovery

Date: 2026-10-20. Scope: the isolated OAuth spike's local operator CLI, following
a reported `APIError: Unauthorized` from `mint-login.ts` on Windows/Node 24.16.0.

## Problem and change

The old script requires the original operator session, which expires after
24 hours. Repeating mint cannot restore it. Previously it emitted a raw library
exception and offered no recovery command. The updated script reports the
rejected session and supports explicit `--renew-operator-session` on the
original operator machine.

Recovery requires the private config/database, a Better Auth-verifiable
original signed cookie and the existing configured synthetic owner. Better Auth
creates/signs the replacement session and generates the one-time token; no
authentication cryptography is reimplemented. The operation exists only in the
local script and uses a server-only library API. It is not an HTTP/MCP endpoint.

The operator auth instance omits OAuth resource registration so minting cannot
reseed scopes or modify client/grant/review policy. Renewal exports only the new
session and verification inserts for optional D1 import. Ordinary mint exports
only verification. Private files are replaced through same-directory temporary
files created with mode 0600; existing config fields are preserved. Missing
database files are not silently recreated. No login code, cookie, secret, raw
exception or SQL is printed.

## Verification

Tests use synthetic private state only. No existing owner credentials were read
and no deployed Worker, D1 database, Fortnox company or saved app was modified.

The regressions exercise:

- Default mint rejects an expired session; the CLI exits 1 with an actionable
  message, no library stack and unchanged prior config/code files.
- Explicit renewal produces a fresh one-use code accepted by the existing Node
  handler and actual local workerd/D1, with replay rejected.
- Stored owner, OAuth/resource policy and prepared/consumed review records are
  preserved; the D1 delta has only two new rows. Existing remote access/refresh
  grants continue to work after importing it.
- Mismatched secrets, forged cookies and missing owners fail without creating
  sessions or changing existing state.
- The real CLI saves the replacement cookie, keeps extra config fields, prints
  no credentials and supports an ordinary subsequent mint. A missing database
  fails without creating an empty replacement.
- The normal HTTP adapter returns 404 for the recovery path.

On Linux x64 with Node 24.19.0/npm 11.9.0: clean OAuth-package locked install,
strict typecheck, Biome (31 files) and the Worker build passed. The complete
OAuth behavioral suite passed **28 tests**, including the three new recovery
regressions and actual local workerd/D1. No runtime dependency was added.
Results and the immutable implementation commit are linked from the PR.

## Limits

This is local, OS-controlled recovery for a disposable synthetic operator, not
production owner recovery. It does not restore missing/corrupt private state,
revive expired/revoked OAuth grants, prove Cloudflare Tunnel origin/proxy
handling, or close S00/G12. Windows PowerShell commands use portable Node APIs
but have not been executed on Windows for this change. The reported Node
24.16.0 is below the project's tested 24.19.0 version; a returned library 401
still establishes rejection of the saved session, not a Node compatibility cause.
