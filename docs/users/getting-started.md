# Getting started — preparation guide

**The Fortnox integration is not yet available.** You can try a Worker/D1 infrastructure installation from the Swedish [Installera page](https://alex-engvall.github.io/fortnox-mcp/installera/). Provisioning, build, migration, deployment and readiness were verified in one existing Cloudflare account on 2026-10-18, using new resources and default names. Fresh-account onboarding and lifecycle checks remain pending. This test does not connect Fortnox or ChatGPT; the remaining sections describe the intended future setup. Do not install a similarly named package assuming it is this project.

Use the Cloudflare account owner's sign-in and check both the signed-in identity and selected account. The verified run used the owner's account-wide `Super Administrator - All Privileges` role. If GitHub authorization ends with `Error connecting to git account`, check the Cloudflare identity and role before replacing the GitHub App connection; installation on GitHub alone does not prove the connection exists in Cloudflare. See [deployment and connection troubleshooting](../deployment.md#github-connection-fails-before-the-build) and [the hosted evidence](../implementation/S11-cloudflare-evidence.md#hosted-installation-verification--2026-10-18).

## What you will need

- Your own deployment account/server and an AI client with the required MCP capabilities.
- Fortnox developer access and your own registered integration.
- Appropriate access to each company you connect, and the Fortnox product licenses/scopes needed for the selected functions.
- A Fortnox test company for initial setup and write testing.

The project software is intended to be free. Fortnox, the AI client and hosting may have separate costs. No central project service or separate model API key is required.

## Intended setup

1. Choose the documented Worker or Node/Docker deployment and establish the installation owner.
2. Register the exact callback URL shown by the setup wizard in your Fortnox integration.
3. Enter Client ID and Client Secret in the secure owner setup, never in an AI conversation.
4. Select the needed capabilities and complete Fortnox's own sign-in/consent.
5. Verify the displayed company and repeat for additional companies.
6. Keep the default embedded review for manual vouchers, or deliberately select client-managed approvals per company.
7. Connect the tested AI client using the installation's instructions, then begin with read-only test-company queries.

## Working with companies

Always name or select the company for an action. Comparisons can include several connected companies, but each write has one explicit target. A visible connection does not grant rights beyond the authenticated owner's provider access.

## Approval modes

Manual vouchers default to review with a button inside a supported client. The owner can switch a company to client-managed approvals. This does not disable accounting validation. If your client cannot support the configured review flow, it cannot execute that booking; it must not downgrade automatically.

Other tools use the client's usual approval controls. Read-only mode, if selected, blocks all writes at the server. Your AI client may also impose additional restrictions.

## Errors and recovery

For missing permissions, check whether the cause is scope, product license or user rights. Newly added scopes may require reconnecting. For uncertain financial-write outcomes, check execution status before retrying. A batch can partially succeed; do not repeat already completed items.

Fortnox remains the persistent home of your financial records. The server keeps only bounded operational state and temporary inputs. See [storage](../contracts/storage.md) for the intended retention policy.
