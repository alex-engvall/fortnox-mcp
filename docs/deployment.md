# Deployment and owner setup

Status: intended deployment contract. No deployment button, Docker image, npm package or hosted project endpoint exists yet.

## Supported target modes

| Mode | Initial direction | Gate |
| --- | --- | --- |
| Cloudflare | Worker HTTP server, supported transactional storage, secrets, private temporary file storage as needed | Measure CPU, schemas, auth, decimal/SIE work, file sizes and cleanup; free tier is not guaranteed |
| Node.js | HTTP server, SQLite/supported durable adapter, local/private temporary storage; Docker packaging | Demonstrate persistence, restart recovery and equivalent policies |
| Local stdio | Optional for supporting clients | Explicit owner/company configuration; not a substitute for remote ChatGPT connectivity |

The core stays independent of Cloudflare-specific APIs. A paid plan may be necessary as resource needs grow. Record dated requirements and measured limits in release documentation; do not hard-code old provider prices as a permanent promise.

## Setup wizard responsibilities

1. Establish the installation owner through a secure bootstrap and admin login.
2. Explain prerequisites and the integration's independent status.
3. Store the owner's Fortnox Client ID/Secret securely and show the exact registered callback URL.
4. Select modules/scopes, initiate provider consent and verify company identity.
5. Add additional companies and show each connection's capability/status.
6. Set read-only/manual-review policy per company; default to manual review.
7. Provide client connection instructions based on tested compatibility.
8. Run redacted connection diagnostics and explain missing scope/license/permission separately.

Do not collect Fortnox passwords in the wizard. The user signs in at Fortnox. Never print secrets in the final setup instructions or require pasting them into the AI conversation.

## Configuration categories

The implementation must document actual variable names in `.env.example`: public base URL, runtime/storage settings, secret-encryption/bootstrap inputs, Fortnox client credentials, OAuth metadata, enabled modules, budgets and retention. Per-company grants and policy live in durable operational state. Examples contain placeholders only.

For owners, describe backup/restore, disconnection, credential rotation, failed approval cleanup, version upgrades and unknown-write recovery. Never recommend retries until a financial operation's status is understood.

## Packaging

Publish versioned artifacts only after tests. Prefer an OCI image and documented Worker configuration/template; add a deploy button only when it creates an independently owned installation without embedded project secrets. A button must not imply that Fortnox developer registration or consent can be skipped.

Future shared hosting requires a new multi-user threat model and identity/tenant design. The single-owner deployment must not be advertised as ready for unrelated public users.
