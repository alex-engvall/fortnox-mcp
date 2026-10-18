# Fortnox MCP

[English](README.md) · [Kom igång](docs/users/kom-igang.sv.md) · [Användarexempel](docs/users/exempel.sv.md)

Ett fristående, ideellt open source-projekt som ska göra det enklare att arbeta med Fortnox genom en AI-klient. För företagare, redovisningsbyråer och utvecklare.

**Projektet är i dokumentations- och utvecklingsfas. Det finns ännu ingen körbar server eller färdig installation.** Beskrivningarna nedan är mål för implementationen. Vi publicerar prereleaser under utvecklingen och en stabil version när bredd och kvalitet är verifierade.

## Det ska du kunna göra

- Ansluta flera företag till din egen installation.
- Läsa och hantera fakturor, kunder, leverantörer, order och bokföringsunderlag.
- Lämna flera kvitton samtidigt och få förslag som du kan granska.
- Bokföra manuella verifikationer med en granskningsknapp som standard.
- Analysera kontosaldon, tillgångar, skulder, eget kapital, resultat och likviditet i AI-klienten.
- Lämna löneunderlag och använda verktyg för att förstå Fortnox API.

ChatGPT prioriteras först. Stöd för Claude följer, med MCP som gemensam grund. Vilka funktioner som fungerar beror även på klientens stöd och företagets Fortnox-licenser.

## Egen installation

Du använder en egen Fortnox-integration och kör verktyget i din miljö. Vi planerar enkel installation på Cloudflare och ett alternativ för egen server med Node.js/Docker. En webbguide ska hjälpa dig att ansluta företag och konfigurera AI-klienten.

Fortnox är den beständiga källan för bokföringen. MCP-servern ska vara tunn, och analysen sker i AI-klienten. Projektet kräver inte en separat AI-modellnyckel.

Läs [kom-igång-guiden](docs/users/kom-igang.sv.md) för förberedelser och [användarexemplen](docs/users/exempel.sv.md) för planerade arbetsflöden.

## Öppen utveckling

Koden och utvecklardokumentationen skrivs på engelska. Svenska guider riktar sig till företagare och redovisningsbyråer. Du är välkommen att bidra med kod, tester, dokumentation och återkoppling enligt [bidragsguiden](CONTRIBUTING.md).

Licensen är [AGPL-3.0-only](LICENSE). Företag får använda verktyget, och andra får erbjuda betald hosting enligt licensen. Projektets egen distribution ska vara gratis; kostnader för Fortnox, AI-klient och hosting kan tillkomma.

Detta är ett självständigt projekt och ingen officiell Fortnox-produkt.
