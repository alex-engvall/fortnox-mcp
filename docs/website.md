# Project website: design, development and publishing

Scope: the owner-requested Swedish public project website and repository introduction, under decision D19. This website is separate from the future MCP server. The examples describe planned capabilities.

## Files and content ownership

- `index.html`: Swedish public copy, semantic sections, navigation and links to the project.
- `site/styles.css`: design tokens, responsive layout and reduced-motion handling.
- `site/main.js`: progressive enhancement for copying the source-clone command.
- `site/brands/`: unmodified official client marks, subject to their owners' terms rather than AGPL.
- `.nojekyll`: serve the repository as static files without a Jekyll transformation.
- `README.md`: concise Swedish repository introduction, with website and developer links.
- `README.en.md`: English contributor entry point.
- `docs/assets/business-owner.webp`: original editorial illustration; provenance is in the [asset notes](assets/README.md).

There is no build step, package installation, external font request, analytics script, login, form submission or API call in the website. All essential content and links work without JavaScript. The copy button appears only when the browser exposes clipboard access in a secure context; a denied copy operation provides a manual-copy message.

Keep status copy in the website, READMEs and [documentation map](README.md) aligned. When implementation progresses, replace planned claims only with capabilities supported by release evidence. The browser illustration is not a product screenshot.

## Publish on GitHub Pages

Before publishing the version with client logos, obtain Anthropic's required prior approval for the Claude mark and this material. No such approval is recorded in this repository. Keep the proposal unmerged until this is resolved, or remove that mark for publication. See [third-party notices](../THIRD_PARTY_NOTICES.md#client-marks). The preview and PR do not establish permission or endorsement.

In repository **Settings → Pages → Build and deployment**, select **Deploy from a branch**, branch **main**, folder **/(root)**. Save the setting. Once this change is merged, `index.html` is the entry point at `https://alex-engvall.github.io/fortnox-mcp/`. Existing Pages settings may already be configured; this documentation change does not modify them.

Use the repository root as the source. The existing `/docs` folder contains developer documentation rather than the public landing page. Technical documentation links deliberately lead to the GitHub source pages, so they do not depend on Markdown-to-HTML URL rewriting.

Styles, script and image paths are relative to `index.html` and support the project URL prefix. The Open Graph image uses the intended public Pages address; update it if the site moves to a custom domain.

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

Three original section concepts guide this proposal:

1. [Opening and illustration](assets/concepts/hero.webp).
2. [Examples and user control](assets/concepts/examples.webp).
3. [Project status and contribution](assets/concepts/community.webp).

These are design references for the proposed website, not a record of user approval of every visual detail. The production page uses native HTML, selectable text and working links; the concepts are not embedded as interface screenshots.

| Token | Value | Use |
| --- | --- | --- |
| Ink | `#152d32` | Text, primary CTA |
| Orange | `#ed7844` | Opening background |
| Ivory | `#fff7ed` | Examples background |
| Petrol | `#244e57` | Control band, code row, footer, emphasis |
| Gold | `#f5d76e` | Contribution background, control headings |
| White | `#ffffff` | Header, project-status section, inverse text |
| Warm rule | `#d8c6b4` | Example separators |

Typography: locally served Inter for content and controls, with locally served Libre Baskerville Italic for two editorial emphasis words. System sans-serif and Georgia/serif fallbacks remain available. The font files retain their SIL Open Font License notices in `site/fonts/`; see [third-party notices](../THIRD_PARTY_NOTICES.md). Large headings, open numbered example rows, three unboxed control columns and a two-column project/contribution layout form the component system. There are no gradients or image overlays. The existing illustration retains its colours, with a gentle crop into the desktop banner and a closer crop on mobile. There is no tint or overlay.

At 800px and below, the header navigation moves to a second row, major layouts stack and the source command wraps. The same information and English developer link remain available. Keyboard focus has a visible outline, the page has a skip link, copy feedback is announced, and reduced-motion preferences disable smooth scrolling.

Intentional accessibility deviation from the opening concept: the italic heading word uses petrol instead of white because white on the orange background does not reach the minimum contrast for large text. The serif styling preserves its emphasis.

Owner-requested addition: official ChatGPT/OpenAI symbol and Claude wordmark in the opening, with readable product names and the explicit label “Planerade AI-klienter”. ChatGPT is marked “Först ut” and Claude “Därefter”, consistent with D18; neither is presented as already supported. Both marks must remain fully visible before scrolling at the checked desktop and mobile sizes. Preserve their supplied artwork, proportions and clear space. Do not apply CSS filters, recolouring or decorative effects. This descriptive client list is separate from the project's identity; it is not a partner logo lockup.

## Rendered proposal previews

- [Desktop preview](assets/website-preview.webp), captured at 1505 × 1045 pixels.
- [Mobile preview](assets/website-mobile-preview.webp), captured at 390 × 844 pixels.

These are screenshots of the implemented static project website, not screenshots of a Fortnox MCP client or completed server functionality.

## Final concept-generation prompts

The concepts were generated with the built-in image generation tool. The existing project illustration and earlier project-only design drafts were used as references. No third-party site image was supplied as a generation asset.

### Opening

```text
Use case: ui-mockup. Redesign the reference first-section website screenshot for the Swedish independent open-source project "Fortnox MCP". Owner now explicitly requests MORE COLOUR and stylistic inspiration from Swedish business organizations Almega, Svenskt Näringsliv and Företagarna. Use their confident editorial clarity, human business imagery, large headings, strong solid colour blocks and sober navigation as inspiration only. Do NOT copy their logos, wording, artwork or exact designs. Create a distinct credible open-source project identity. White 88px header, plain text "Fortnox MCP" left, nav "Möjligheter", "Projektet", "Bidra", "English / dev", dark petrol small "GitHub" button at right. Main hero full-width warm saturated ORANGE #ED7844, text near-black #152D32, one emphasized italic serif word "företag" WHITE (large enough for contrast); exact large headline "Mer tid för ditt företag. Bättre koll på ekonomin." preserve original three-line arrangement left. Right support exact "Fortnox i din AI-assistent. Ett öppet projekt för att förenkla kvitton, fakturor och ekonomiska frågor." Main CTA near-black with white text "Utforska möjligheterna" and a long thin arrow. Below a small dark sentence "Under utveckling. Ingen färdig installation ännu." Keep existing panoramic business-owner illustration in 3:1 frame below text, original image colors, small4px corners not giant round wrappers, no tint or overlay. Caption "En tänkt arbetssituation — funktionerna är under utveckling." At bottom preview next section with warm ivory #FFF7ED background and heading "Börja med en fråga." Type system: bold clean system sans for headings, restrained serif italic accent for just one word; readable19px body, ample72px gutters, open composition, no cards, practical HTML/CSS desktop screenshot 1505x1045. Coherent downstream palette uses ivory examples, deep PETROL #244E57 user-control band with white text, white project-status area, warm GOLD #F5D76E community band with dark text and petrol code row, petrol footer. No gradients, cartoon decorations, fake stats, pricing, badges above headline, product screenshots or invented claims. All UI text and controls will be native HTML/CSS. This is the full first-section concept including next-section preview.
```

### Examples and control

```text
Edit the first reference (the Fortnox MCP examples/control SECTION 2 website design) to use the final business-organization-inspired palette of the second reference. Keep ALL exact copy, rows, hierarchy, open list structure, spacing and columns. This is a fresh standalone legible section screenshot about1505x1045, not a crop of the reference. Upper examples section background warm IVORY #FFF7ED, near-black #152D32 headings, thin warm neutral dividers #D8C6B4, muted dark teal numbering. Main heading "Börja med en fråga." Support "Exempel på vad vi bygger mot. Du beskriver uppgiften, assistenten hjälper dig vidare med uppgifter från Fortnox." Four generous open rows, numbers01–04, no cards: "Förstå ekonomin" / "Varför blev resultatet lägre det här kvartalet? Visa vad som förändrats mest."; "Få ordning på kvittona" / "Här är åtta kvitton. Förbered bokföringsförslag och markera det jag behöver komplettera."; "Förbered en faktura" / "Ta fram ett fakturaförslag från det här underlaget. Visa mig förslaget innan vi går vidare."; "Följ flera företag" / "Jämför mina två företag den här månaden. Visa företagen var för sig." Small note "Underlag och beräkningar ska vara spårbara. Saknade uppgifter ska framgå." Bottom user-control band full-width deep PETROL #244E57 with white heading "Du har sista ordet." and three open columns with titles in warm GOLD #F5D76E: "Ditt godkännande." / "Manuella verifikationer ska som standard granskas och godkännas av dig."; "Rätt företag." / "Varje ändring ska ha ett tydligt målföretag. Flera företag ska kunna anslutas."; "Fortnox som grund." / "Bokföringen hör hemma i Fortnox. Analysen sker i din valda AI-klient." White body text in the petrol band. Use confident business-site typographic hierarchy, broad gutters, no gradients, no illustrations here, no logos copied from organizations, no product dashboard or invented claims. Native HTML/CSS implementation is planned. No header, hero or other sections.
```

### Status and contribution

```text
Edit the first reference (SECTION 3 of Fortnox MCP homepage) to match the final orange/petrol/gold design system of the second reference. Keep the exact Swedish copy, hierarchy, structure, gutters, two-column status layout, contribution band, clone-command row and footer. This should be a fresh readable complete section screenshot about1520x1035. Top project status background pure white #ffffff and dark ink #152D32. Heading "Vi bygger grunden först." paragraph "Projektet är i dokumentations- och utvecklingsfas. Det finns ännu ingen körbar MCP-server eller färdig installation." link "Läs byggplanen". Right three open rows: "Nu" / "Dokumentation och arkitektur"; "Nästa steg" / "Verifiera anslutningar och godkännanden"; "Därefter" / "Testade prereleaser, sedan en stabil version". Below, contribution band warm GOLD #F5D76E with dark ink text. Large heading "Öppen kod. Gemensam nytta." with the serif italic word "nytta" in deep petrol #244E57. Right paragraph "Ett fristående, ideellt projekt för företagare, redovisningsbyråer och utvecklare. Du kan bidra med erfarenheter, tester, guider eller kod." Two buttons: solid deep-petrol with white text "Dela en idé", outlined dark "Bidra med kod". Small "Diskussioner på svenska och engelska." Clone-command row deep PETROL background #244E57, off-white mono text "gh repo clone alex-engvall/fortnox-mcp" and outlined light button "Kopiera". Footer deep PETROL #244E57 with white text wordmark "Fortnox MCP", sentence "Ett självständigt projekt. Ingen officiell Fortnox-produkt." and links "GitHub", "AGPL-3.0-only", "English / dev". Styling inspired by bold, clear Swedish business-organization sites; no copied logos, no screenshots copied from those sites. No gradients, pills, marketing metrics, membership, prices, new claims or decorative objects. Same plain system-sans UI typography and serif accent. All text and controls will be real accessible HTML/CSS.
```
