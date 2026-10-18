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

### Service names on the website

The current website uses plain-text product names to describe the planned integration. It contains no OpenAI/ChatGPT or Claude logo files. OpenAI's and Anthropic's marks are not part of the project's AGPL grant.

The earlier logo proposal was removed at the owner's request during the hero redesign. In particular, Anthropic's [trademark guidelines](https://www.anthropic.com/legal/trademark-guidelines) require prior approval for materials using its marks; no such approval is recorded. Do not restore the Claude artwork without resolving that requirement. The use of a product name in technical compatibility documentation does not claim endorsement or an implemented integration.

When implementation adds dependencies, record their versions and licenses in the lockfile and release SBOM. Verify compatibility with AGPL-3.0-only before distribution. Do not infer a dependency's license from the language or ecosystem.
