# Project website: design, development and publishing

Scope: the owner-requested Swedish public project website and repository introduction, under decision D19. This website is separate from the future MCP server. The examples describe planned capabilities.

## Files and content ownership

- `index.html`: Swedish public copy, semantic sections, navigation and links to the project.
- `installera/index.html`: Swedish installation subpage with an active Cloudflare deployment link, prerequisites, current limitations, first steps and ownership/update/removal guidance.
- `site/install-button.svg`: project-authored README button linking to the installation subpage.
- `site/styles.css`: design tokens, responsive layout and reduced-motion handling.
- `site/main.js`: progressive enhancement for copying the source-clone command.
- `.nojekyll`: serve the repository as static files without a Jekyll transformation.
- `README.md`: concise Swedish repository introduction, with website and developer links.
- `README.en.md`: English contributor entry point.
- `docs/assets/business-owner.webp`: earlier editorial illustration retained for provenance; not used on the current homepage.
- `docs/assets/concepts/hero.webp`: current header/hero concept; native website text and controls are implemented in HTML/CSS.

There is no build step, package installation, external font request, analytics script, login, form submission or API call in the website. All essential content and links work without JavaScript. The copy button appears only when the browser exposes clipboard access in a secure context; a denied copy operation provides a manual-copy message.

Keep status copy in the website, READMEs and [documentation map](README.md) aligned. When implementation progresses, replace planned claims only with capabilities supported by release evidence. The homepage has no hero illustration, product screenshot or client-logo gallery.

## Publish on GitHub Pages

In repository **Settings → Pages → Build and deployment**, select **Deploy from a branch**, branch **main**, folder **/(root)**. Save the setting. Once this change is merged, `index.html` is the entry point at `https://alex-engvall.github.io/fortnox-mcp/`. Existing Pages settings may already be configured; this documentation change does not modify them.

Use the repository root as the source. The existing `/docs` folder contains developer documentation rather than the public landing page. Technical documentation links deliberately lead to the GitHub source pages, so they do not depend on Markdown-to-HTML URL rewriting.

Asset paths are relative to each HTML entry and support the project URL prefix. The installation page is served at `https://alex-engvall.github.io/fortnox-mcp/installera/`. The homepage Open Graph image uses the intended public Pages address; update it if the site moves to a custom domain.

The active Deploy to Cloudflare link targets the complete repository's default branch. Publish it with the root `wrangler.jsonc` and S01 dependency, so Cloudflare can detect the build/deploy commands and shared workspace packages. GitHub Pages hosts only these static pages; it never runs the Worker or holds credentials. First-account Cloudflare acceptance is pending and disclosed on the page. See [the first-installation plan](implementation/S11-cloudflare-first-installation.md) and [evidence](implementation/S11-cloudflare-evidence.md).

GitHub Pages hosts this static introduction. Fortnox connections, credentials and MCP requests need the separate runtime described in [deployment](deployment.md).

Official references: [publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [entry files and static publishing](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

## Local preview

From the repository root, use any static HTTP server. For example, with Python 3 installed:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/`. Stop the server with Ctrl+C. No server implementation or Fortnox access is involved.

When changing assets or code, verify the root entry and a project-prefix URL, keyboard navigation, desktop/mobile layout and the copy control. Check that no primary content depends on JavaScript. A clipboard success test needs a browser that grants clipboard access to the local HTTP origin.

## Design direction

The owner requested more colour and inspiration from [Almega](https://www.almega.se/), [Svenskt Näringsliv](https://www.svensktnaringsliv.se/) and [Företagarna](https://www.foretagarna.se/). Their public homepages were inspected on 2026-10-18. The inspiration is confident business-facing typography, strong colour fields, human imagery, a clear benefit statement and useful navigation. No logos, photos, text or source code from those sites are included.

Three original section concepts guide the website. The opening was replaced at the owner's request on 2026-10-18 to make the purpose and free/open-source model immediately clear:

1. [Header and typography-led opening](assets/concepts/hero.webp).
2. [Examples and user control](assets/concepts/examples.webp).
3. [Project status and contribution](assets/concepts/community.webp).

These are design references for the proposed website, not a record of user approval of every visual detail. The production page uses native HTML, selectable text and working links; the concepts are not embedded as interface screenshots.

| Token | Value | Use |
| --- | --- | --- |
| Ink | `#152d32` | Text, primary CTA |
| Ivory | `#fff7ed` | Examples background |
| Petrol | `#244e57` | Header, hero, control band, code row, footer |
| Gold | `#f5d76e` | Hero emphasis/CTA, contribution background, control headings |
| White | `#ffffff` | Header, project-status section, inverse text |
| Warm rule | `#d8c6b4` | Example separators |

Typography: locally served Inter for the header, hero, content and controls. Libre Baskerville Italic remains an accent in the contribution section. Font files retain their SIL Open Font License notices in `site/fonts/`; see [third-party notices](../THIRD_PARTY_NOTICES.md). The hero is a single open text column with generous whitespace, a large two-line headline and two real links. There is no hero image, gradient, logo gallery, decorative card or dashboard mockup. The header shares the hero's petrol background, separated by a subtle rule; its GitHub link has a light outline.

The image-generated concept is a visual reference, not a runtime asset. All headings, descriptions, status text and controls are native accessible HTML. The earlier business-owner illustration and previous client logo list have been removed from the homepage. Claude is absent from the public page and both previously bundled logo files have been deleted. D18's future technical compatibility target is unchanged; plain-text technical references do not represent logo permission or verified support.

### Opening copy and implementation inventory

The user-authorized focus is Fortnox, connecting ChatGPT, free software and open source. The exact allowed header/hero copy is:

- Brand/navigation: “Fortnox MCP”, “Möjligheter”, “Projektet”, “Bidra”, “Installera”, “English / dev”, “GitHub”.
- Heading: “Koppla ChatGPT till Fortnox.”
- Value statement: “Gratis. Öppen källkod.”
- Description: “Vi bygger en MCP-server som låter dig arbeta med Fortnox i ChatGPT. Ställ frågor om ekonomin och få hjälp med fakturor och kvitton.”
- Primary action: “Installera testversion”, linking to `/installera/`; secondary action: “Se koden på GitHub”, linking to the repository.
- Status: “Första testversion. Fortnox och ChatGPT är ännu inte anslutna.”
- Cost clarification: “Programvaran är gratis. Fortnox, AI-klient och drift kan ha egna kostnader.”

Use Inter, tight but readable headline tracking and warm gold for “Fortnox.” and the primary action. The concept uses the same petrol/ivory/gold system as the lower page. Preserve the open examples, three control columns and project/contribution sections. Outlined SVG arrows retain the site's existing stroke style; no third-party logo artwork is needed.

At 800px and below, header navigation occupies its own row and actions wrap naturally. Headline text may wrap into three lines on small phones. Short desktop windows use smaller type and spacing so the purpose, free/open-source statement and primary action remain visible. The English developer link, keyboard skip link, focus outlines, copy feedback and reduced-motion behavior remain available.

## Rendered proposal previews

These homepage previews predate the first-installation navigation/CTA. Current rendered QA for that slice is recorded in [S11 evidence](implementation/S11-cloudflare-evidence.md); the concept-generation prompts below are historical design provenance.

- [Desktop preview](assets/website-preview.webp), captured at 1536 × 1024 pixels.
- [Mobile preview](assets/website-mobile-preview.webp), captured at 390 × 844 pixels.

These are screenshots of the implemented static project website, not screenshots of a Fortnox MCP client or completed server functionality.

## Final concept-generation prompts

The concepts were generated with the built-in image generation tool. The existing project illustration and earlier project-only design drafts were used as references. No third-party site image was supplied as a generation asset.

### Opening

Generated with the built-in image tool on 2026-10-18. The revised concept is a header and hero only; the two lower-section concepts remain references for unchanged sections.

```text
Use case: ui-mockup. Create a polished standalone DESKTOP homepage opening concept for the independent Swedish open-source project Fortnox MCP, 1536 x 1024 landscape. This is ONLY the requested header and hero redesign plus a small next-section preview, not an entire website. The existing lower page uses ivory, petrol and warm gold with editorial typography. New direction: extremely clean, direct, sophisticated typography, NO photograph, NO illustration, NO dashboard, NO card grids, NO hero badge or eyebrow. Header and hero have one continuous flat deep petrol background #244E57, near-white #FFF7ED text, subtle thin translucent bottom border under header. 80px header, generous 72px gutters. Left text wordmark “Fortnox MCP”. Center nav exact “Möjligheter”, “Projektet”, “Bidra”, “English / dev”. Right small outlined light button “GitHub” with thin up-right arrow. Hero text left aligned with calm whitespace and max width about 1000px; no visual to its right. Main headline in Inter-like bold sans-serif, 92px, tight tracking, two lines, exact “Koppla ChatGPT” then “till Fortnox.” The word “Fortnox.” warm gold #F5D76E, the rest near-white. Below headline bold 25px statement “Gratis. Öppen källkod.” Below that a restrained readable 22px paragraph max 760px wide, exact “Vi bygger en MCP-server som låter dig arbeta med Fortnox i ChatGPT. Ställ frågor om ekonomin och få hjälp med fakturor och kvitton.” Then horizontal actions: warm-gold filled button dark petrol text “Utforska projektet” with thin right arrow; quiet white underlined link “Se koden på GitHub” with up-right arrow. Under actions at 18px “Under utveckling. Ingen färdig installation ännu.” Beneath small 14px cost clarification “Programvaran är gratis. Fortnox, AI-klient och drift kan ha egna kostnader.” Hero bottom around 820px then next section ivory #FFF7ED, top of heading “Börja med en fråga.” visible at bottom. Palette only petrol, ivory, gold, white. No orange in hero. Native selectable text and controls in final implementation, no bitmap UI shipped. No Claude name or logo anywhere. No third-party logos in concept, plain ChatGPT product name is sufficient. No other text or invented claims, no additional navigation, no pricing or marketing metrics. Preserve open-source/community character, prioritize immediate clarity about Fortnox and ChatGPT. A stylish professional Swedish business-facing website with restrained layout, no gradients, no decorative shapes.
```

### Examples and control

```text
Edit the first reference (the Fortnox MCP examples/control SECTION 2 website design) to use the final business-organization-inspired palette of the second reference. Keep ALL exact copy, rows, hierarchy, open list structure, spacing and columns. This is a fresh standalone legible section screenshot about1505x1045, not a crop of the reference. Upper examples section background warm IVORY #FFF7ED, near-black #152D32 headings, thin warm neutral dividers #D8C6B4, muted dark teal numbering. Main heading "Börja med en fråga." Support "Exempel på vad vi bygger mot. Du beskriver uppgiften, assistenten hjälper dig vidare med uppgifter från Fortnox." Four generous open rows, numbers01–04, no cards: "Förstå ekonomin" / "Varför blev resultatet lägre det här kvartalet? Visa vad som förändrats mest."; "Få ordning på kvittona" / "Här är åtta kvitton. Förbered bokföringsförslag och markera det jag behöver komplettera."; "Förbered en faktura" / "Ta fram ett fakturaförslag från det här underlaget. Visa mig förslaget innan vi går vidare."; "Följ flera företag" / "Jämför mina två företag den här månaden. Visa företagen var för sig." Small note "Underlag och beräkningar ska vara spårbara. Saknade uppgifter ska framgå." Bottom user-control band full-width deep PETROL #244E57 with white heading "Du har sista ordet." and three open columns with titles in warm GOLD #F5D76E: "Ditt godkännande." / "Manuella verifikationer ska som standard granskas och godkännas av dig."; "Rätt företag." / "Varje ändring ska ha ett tydligt målföretag. Flera företag ska kunna anslutas."; "Fortnox som grund." / "Bokföringen hör hemma i Fortnox. Analysen sker i din valda AI-klient." White body text in the petrol band. Use confident business-site typographic hierarchy, broad gutters, no gradients, no illustrations here, no logos copied from organizations, no product dashboard or invented claims. Native HTML/CSS implementation is planned. No header, hero or other sections.
```

### Status and contribution

```text
Edit the first reference (SECTION 3 of Fortnox MCP homepage) to match the final orange/petrol/gold design system of the second reference. Keep the exact Swedish copy, hierarchy, structure, gutters, two-column status layout, contribution band, clone-command row and footer. This should be a fresh readable complete section screenshot about1520x1035. Top project status background pure white #ffffff and dark ink #152D32. Heading "Vi bygger grunden först." paragraph "Projektet är i dokumentations- och utvecklingsfas. Det finns ännu ingen körbar MCP-server eller färdig installation." link "Läs byggplanen". Right three open rows: "Nu" / "Dokumentation och arkitektur"; "Nästa steg" / "Verifiera anslutningar och godkännanden"; "Därefter" / "Testade prereleaser, sedan en stabil version". Below, contribution band warm GOLD #F5D76E with dark ink text. Large heading "Öppen kod. Gemensam nytta." with the serif italic word "nytta" in deep petrol #244E57. Right paragraph "Ett fristående, ideellt projekt för företagare, redovisningsbyråer och utvecklare. Du kan bidra med erfarenheter, tester, guider eller kod." Two buttons: solid deep-petrol with white text "Dela en idé", outlined dark "Bidra med kod". Small "Diskussioner på svenska och engelska." Clone-command row deep PETROL background #244E57, off-white mono text "gh repo clone alex-engvall/fortnox-mcp" and outlined light button "Kopiera". Footer deep PETROL #244E57 with white text wordmark "Fortnox MCP", sentence "Ett självständigt projekt. Ingen officiell Fortnox-produkt." and links "GitHub", "AGPL-3.0-only", "English / dev". Styling inspired by bold, clear Swedish business-organization sites; no copied logos, no screenshots copied from those sites. No gradients, pills, marketing metrics, membership, prices, new claims or decorative objects. Same plain system-sans UI typography and serif accent. All text and controls will be real accessible HTML/CSS.
```
