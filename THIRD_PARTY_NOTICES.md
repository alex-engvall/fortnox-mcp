# Third-party material and names

Project-authored code and documentation use AGPL-3.0-only. This does not grant rights to Fortnox's API specification, documentation, trademarks, customer data or other third-party material.

## Fortnox specification

The initial design was informed by a user-supplied `openapi.json`, identified in [source-lock.json](docs/reference/source-lock.json). Its `info.license` field is absent. The file is not committed or relicensed here. Obtain an authorized copy from Fortnox for local development and preserve provenance. Review redistribution rights before vendoring specifications or generating redistributable code from them.

The inventory in this repository contains resource names, counts and original design classifications; it is not a replacement for Fortnox documentation. Source links are in [sources](docs/reference/sources.md). Keep downloaded third-party documentation out of git unless its redistribution terms have been checked.

## License text

`LICENSE` contains the GNU Affero General Public License version 3 text. The license itself permits verbatim copying; its own notice is retained. The initial copy was retrieved from the SPDX license-list-data repository, `text/AGPL-3.0-only.txt`.

## Names and dependencies

### Website fonts

The website bundles unmodified Latin WOFF2 font files from `@fontsource-variable/inter` 5.3.0 and `@fontsource/libre-baskerville` 5.3.0. These font files use SIL Open Font License 1.1, rather than the project's AGPL license. Their original copyright and complete license notices are retained in [INTER-LICENSE.txt](site/fonts/INTER-LICENSE.txt) and [LIBRE-BASKERVILLE-LICENSE.txt](site/fonts/LIBRE-BASKERVILLE-LICENSE.txt).

- Inter: [upstream project](https://github.com/rsms/inter), [Fontsource package](https://www.npmjs.com/package/@fontsource-variable/inter). `inter-latin.woff2` SHA-256: `3100e775e8616cd2611beecfa23a4263d7037586789b43f035236a2e6fbd4c62`.
- Libre Baskerville: [upstream project](https://github.com/impallari/Libre-Baskerville), [Fontsource package](https://www.npmjs.com/package/@fontsource/libre-baskerville). `libre-baskerville-italic-latin.woff2` SHA-256: `efb7e5f4376a557314f5bb9f5197ef837d86c0ab38e1a50a0ff5c60c3400c629`.

### Service names and future dependencies

Fortnox is used descriptively. This project is not an official Fortnox integration or an endorsement by Fortnox, OpenAI, Anthropic or Cloudflare. Do not use their logos without appropriate permission.

### Client marks

The website proposal contains the following unmodified official assets, retrieved on 2026-10-18. These marks and their associated rights belong to their respective owners; they are excluded from the project's AGPL grant. Their presence describes planned client targets, not a partnership, endorsement or completed integration.

| Repository asset | Official source and original file | Owner and terms |
| --- | --- | --- |
| `site/brands/chatgpt.svg` | [OpenAI logo pack](https://cdn.openai.com/brand/OpenAI-Logos-2025.zip), `OpenAI-logos(new)/SVGs/OpenAI-black-monoblossom.svg` | OpenAI; [design guidelines and usage terms](https://openai.com/brand/). The supplied symbol accompanies the plain-text product name ChatGPT. |
| `site/brands/claude.svg` | [Anthropic press kit](https://anthropic.com/press-kit), `Anthropic media resources/Anthropic logos/Claude logos/1 Claude logo/SVG/Claude logo - Slate.svg` | Anthropic, PBC; [trademark guidelines](https://www.anthropic.com/legal/trademark-guidelines). |

Anthropic's published guidelines require prior approval of the materials using its marks. This repository records no such approval: resolve it before merging/publishing this proposal, or omit the Claude mark from the published page. Download availability is not proof of permission. Do not infer or transfer trademark rights from the repository's license. Preserve official artwork, spacing and proportions, and recheck current terms when changing its use.

When implementation adds dependencies, record their versions and licenses in the lockfile and release SBOM. Verify compatibility with AGPL-3.0-only before distribution. Do not infer a dependency's license from the language or ecosystem.
