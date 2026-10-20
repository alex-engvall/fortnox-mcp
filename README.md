# Fortnox MCP 🧩

[Projektets hemsida](https://alex-engvall.github.io/fortnox-mcp/) · [English developer README](README.en.md) · [Kom igång](docs/users/kom-igang.sv.md) · [Frågor och idéer](https://github.com/alex-engvall/fortnox-mcp/discussions)

**Koppla ChatGPT till Fortnox. Gratis. Öppen källkod.**

Fortnox MCP är ett fristående open source-projekt som ska göra det enklare att arbeta med Fortnox direkt från din AI-assistent. För företagare i olika branscher, redovisningsbyråer och utvecklare.

> 🚧 **Under utveckling.** En lokal [TypeScript-grund för utvecklare](docs/development.md) finns med syntetiskt MCP-verktyg, Node/Worker och automatiska tester. Det finns ännu ingen färdig Fortnox-installation eller verifierad ChatGPT-anslutning. Exemplen beskriver vad vi bygger mot.

<a href="https://alex-engvall.github.io/fortnox-mcp/installera/"><img src="site/install-button.svg" alt="Installera testversion – öppna installationsguiden" width="240" height="52"></a>

Prova en första testinstallation av Worker och databas i ditt eget Cloudflare-konto. **Fortnox och ChatGPT ansluts i kommande steg.** Installation och statuskontroll har [verifierats i ett befintligt konto](docs/implementation/S11-cloudflare-evidence.md#hosted-installation-verification--2026-10-18). Logga in med Cloudflare-kontots ägare; helt nya konton och hela livscykeln återstår att testa.

## 💬 Det här vill vi göra möjligt

- Förstå resultat, kostnader och likviditet med uppgifter från Fortnox.
- Hantera flera kvitton i samma flöde och granska bokföringsförslagen.
- Förbereda kundfakturor och hålla koll på kommande betalningar.
- Arbeta med flera företag utan att blanda ihop bokföringen.
- Lämna löneunderlag och bygga vidare på fler arbetsflöden över tid.

Manuella verifikationer ska som standard kräva ditt godkännande före bokföring. Fortnox är den beständiga källan för ekonomin, och analysen sker i din valda AI-klient.

ChatGPT är första klienten vi ska verifiera, Claude därefter. Du ska kunna köra kopplingen i din egen miljö med din egen Fortnox-integration. Programvaran ska vara gratis; Fortnox, AI-klient och hosting kan ha egna kostnader.

## 🌐 En hemsida för projektet

[Hemsidan](https://alex-engvall.github.io/fortnox-mcp/) är projektets publika presentation på svenska. Källan finns i [index.html](index.html), med stil och funktioner i [site/](site/). Publicering och lokal förhandsvisning beskrivs i [webbplatsguiden](docs/website.md).

Hemsidan är statisk och förberedd för GitHub Pages. Själva MCP-servern behöver en egen körmiljö.

## 🤝 Bidra med det du kan

Beskriv ett arbetsflöde som tar onödig tid, testa, förbättra en guide eller bidra med kod. **Frågor, idéer och utvecklardiskussioner är välkomna på svenska och engelska.** Kod och teknisk referensdokumentation skrivs på engelska.

- [Ställ en fråga eller dela en idé](https://github.com/alex-engvall/fortnox-mcp/discussions)
- [Läs användarexemplen](docs/users/exempel.sv.md)
- [Börja som utvecklare](README.en.md), läs [bidragsguiden](CONTRIBUTING.md) och [CLA-villkoren](CLA.md)

Projektet licensieras under [AGPL-3.0-only](LICENSE). Bidragsgivare behåller sin upphovsrätt och ger genom ett separat [CLA](CLA.md) Easy Today AB rätt att även använda accepterade bidrag i separat licensierade produkter. Det ändrar inte Community-versionens öppna licens. Projektet är ingen officiell Fortnox-produkt. Se [information om tredjepartsmaterial och namn](THIRD_PARTY_NOTICES.md).
