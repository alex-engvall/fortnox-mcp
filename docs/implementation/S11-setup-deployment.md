# S11 — Setup wizard and deployment

Status: not started. Depends on S02/S03; final workflow acceptance depends on S06/S07.

## Deliver

Implement the small owner wizard from [deployment](../deployment.md): bootstrap/login, own Fortnox credentials, company consent/status, policy settings and tested ChatGPT connection instructions. Add Swedish/English UI and documentation. Admin configuration is not exposed as model tools.

Package Node/Docker and Worker deployments with persistent operational storage, secure secret configuration, private temporary files and cleanup. Provide backup/restore, disconnect, credential rotation and upgrade steps. Add a deployment button only after its independent-installation path is verified.

## Acceptance

A new owner can follow the guide in a clean environment, connect two test companies and run read/review/file scenarios. Test restarting during pending approval and unknown write without losing recovery state. Prove parity for financial policies across runtimes.

Record resource measurements, current hosting constraints and when a paid plan/Node deployment is needed. Do not promise free unlimited hosting or direct ChatGPT access to a local stdio process.

## Handoff

Replace planned setup instructions with actual versioned commands and screenshots only after testing. Remove stale placeholders and preserve an explicit capability/status section.
