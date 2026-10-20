# CLA onboarding and enforcement — maintainer runbook

**Decision:** 2026-10-20. The CLA recipient is **Easy Today AB**. Public Project releases remain **AGPL-3.0-only**. The agreement is [CLA.md](../../CLA.md), version 1.0. This procedure is **not active merely because it exists in Git**.

## Prerequisites before enabling signing

1. Have Swedish IP/legal counsel review the wording in `CLA.md`, the company identity and signing mechanism (including employee, contractor and entity-authority cases).
2. Confirm that Easy Today AB has all rights needed to license the existing baseline code commercially. Commit author names or GitHub repository ownership alone do not establish this. **A new CLA does not cover earlier contributions retroactively.**
3. Approve a privacy notice for signature processing: controller, contact channel, purpose, legal basis, retention, third-party providers and data-subject rights. Verify the CLA provider's privacy/data-processing terms before sharing signer data.
4. Agree who within Easy Today AB can administer signatures and authorize exceptions. Keep a dated record of the approved agreement version and any exceptions.

## Recommended GitHub integration: CLA Assistant

[CLA Assistant](https://github.com/apps/cla-assistant) is a third-party GitHub App. Its [project documentation](https://github.com/cla-assistant/cla-assistant) describes GitHub-authenticated signing, PR comments, a status check and re-signing after the Gist document changes. GitHub repository files **alone** do not install or configure the App.

1. After legal and privacy approval, publish the **exact reviewed text** of `CLA.md` as a versioned GitHub **Gist** controlled by an approved company administrator. Record its URL and a hash of the agreed document in the private legal records.
2. Sign in to [cla-assistant.io](https://cla-assistant.io/) and authorize the GitHub App for **only** `alex-engvall/fortnox-mcp` where possible. Review the permissions and third-party terms before accepting them.
3. Link the repository to the Gist in CLA Assistant. Do **not** quietly change the Gist text or switch the linked agreement without documenting a version change.
4. Open a test PR with a previously unsigned external account. Verify that it requests acceptance of the **correct Easy Today AB agreement version**, records the signature and reports the expected GitHub status. Repeat with an already signed account and, where possible, multiple authors.
5. Inspect `main` protection in **Settings → Branches** (or the active **Ruleset**). Add the **exact CLA status check emitted by the App** as a required check alongside existing CI checks. Avoid replacing or weakening existing protection. Require PRs and avoid administrator bypass if practical; record the actual settings and enforcement test rather than assuming protection is already configured.
6. Test that an **unsigned** PR cannot merge and a **signed** PR can proceed subject to all existing reviews and CI. Review merge-queue and direct-push behavior if enabled. If a CLA check never appears, do not configure a guessed check name.
7. Protect access to signing records and retain evidence of who signed which version, when, through which GitHub identity and for which PR. Restrict exceptions to documented, authorized cases.

**Activation status:** Not configured or verified by this change. App installation, Gist creation, branch-protection updates and tests require repository/organization administrator actions.

## Contribution review after activation

- A green bot status is necessary but not always sufficient: manually inspect co-authors, copied code, external dependencies, employer/customer-owned contributions and organization signatory authority.
- Do not automatically allowlist human contributors. For dependency-update bots, only grant narrowly scoped exemptions after a maintainer has reviewed provenance and rights.
- Use issues/discussions for non-code feedback without demanding a signature. Do not publish private contributor agreements, email addresses or employer authorizations in issues or the repository.
- Existing contributions are covered only by rights already granted. Obtain separate authorization for any existing third-party code that the Company wants to include in a proprietary product.
- A Community contribution accepted under this process continues to be publicly available under AGPL-3.0-only, even if independently licensed elsewhere by Easy Today AB.

## Changing the CLA

1. Obtain fresh legal approval and choose a new version number.
2. Update `CLA.md`, `CONTRIBUTING.md` if necessary, and this runbook in one PR.
3. Publish the new signed-off version to the CLA Assistant Gist and preserve the prior text/evidence.
4. Verify that CLA Assistant requests a new signature where required; do not assume the old signature covers materially changed terms.
5. Record the change, effective date and non-retroactive scope in [decisions.md](../decisions.md).

## Not part of this change

No proprietary repository, GitHub App, external Gist, branch rule, commercial license, contributor signature, consent record or premium service is created by documentation alone.
