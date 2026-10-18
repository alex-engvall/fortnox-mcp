# S11 — Setup wizard and deployment

Status: first infrastructure slice implemented; hosted acceptance pending. The protected wizard depends on S02/S03; final workflow acceptance depends on S06/S07. See [the first Cloudflare slice](S11-cloudflare-first-installation.md) and [evidence](S11-cloudflare-evidence.md).

## Deliver

Implement the small owner wizard from [deployment](../deployment.md): bootstrap/login, own Fortnox credentials, company consent/status, policy settings and tested ChatGPT connection instructions. Add Swedish/English UI and documentation. Admin configuration is not exposed as model tools.

Package Node/Docker and Worker deployments with persistent operational storage, secure secret configuration, private temporary files and cleanup. Provide backup/restore, disconnect, credential rotation and upgrade steps. The owner requested an active first-test Cloudflare button from initial publication, with explicit capability and pending-verification status. Verify and record the independent-installation path before claiming it is supported.

## Acceptance

A new owner can follow the guide in a clean environment, connect two test companies and run read/review/file scenarios. Test restarting during pending approval and unknown write without losing recovery state. Prove parity for financial policies across runtimes.

Record resource measurements, current hosting constraints and when a paid plan/Node deployment is needed. Do not promise free unlimited hosting or direct ChatGPT access to a local stdio process.

## Handoff

Replace planned setup instructions with actual versioned commands and screenshots only after testing. Remove stale placeholders and preserve an explicit capability/status section.
