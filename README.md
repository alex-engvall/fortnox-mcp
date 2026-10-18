# Fortnox MCP 🧩

[English developer README](README.en.md) · [Kom igång](docs/users/kom-igang.sv.md) · [Frågor och idéer](https://github.com/alex-engvall/fortnox-mcp/discussions)

**Mer tid för ditt företag. Bättre koll på ekonomin.**

Kvitton som ska tas om hand, kunder som ska faktureras och siffror du vill förstå. Som företagare har du mycket att hålla reda på.

Fortnox MCP är ett öppet projekt som ska göra det enklare att ta hand om ekonomin direkt från din AI-assistent. Fråga om kostnaderna, få hjälp med underlagen och förbered nästa steg med uppgifter från ditt Fortnox.

![Illustration av en företagare som går igenom kvitton och fakturor vid en dator.](docs/assets/business-owner.webp)

> 🚧 **Under utveckling.** Dokumentationsgrunden och byggplanen är klara. Det finns ännu ingen färdig installation. Exemplen nedan visar vad vi vill göra möjligt; illustrationen visar en tänkt arbetssituation.

## 💬 Börja med det du behöver hjälp med

Du ska kunna skriva som du skulle prata med en kollega. Här är några exempel på planerade arbetsflöden:

| I företagarens vardag | Så kan du be om hjälp |
| --- | --- |
| **Förstå ekonomin** | ”Varför blev resultatet lägre det här kvartalet? Visa vilka intäkter och kostnader som förändrats mest.” |
| **Få ordning på kvittona** | ”Här är åtta kvitton från veckans inköp. Förbered bokföringsförslag och markera det jag behöver komplettera.” |
| **Fakturera kunder** | ”Förbered en kundfaktura utifrån det här underlaget. Visa förslaget innan vi går vidare.” |
| **Planera kommande betalningar** | ”Vilka leverantörsfakturor förfaller de närmaste två veckorna? Visa också öppna kundfakturor och bokförda bank- och kassasaldon.” |
| **Följa flera företag** | ”Jämför intäkter och kostnader för mina två företag den här månaden. Visa företagen var för sig.” |

Analyserna ska utgå från uppgifterna i Fortnox och visa var siffrorna kommer ifrån. Om underlag saknas ska det framgå. Bokförda bankbelopp kan skilja sig från saldot hos banken.

## 🧾 Från underlag till nästa steg

Målet är att du ska kunna göra hela arbetsflödet i AI-assistenten:

1. **Berätta vad du vill göra.** Ange företag och lämna eventuella underlag.
2. **Få ett begripligt svar eller förslag.** Se belopp, underlag och sådant som behöver kompletteras.
3. **Granska och gå vidare.** Manuella verifikationer ska som standard kräva ditt godkännande innan de bokförs.
4. **Se vad som blev gjort.** Varje kvitto ska ha en egen status, så att du vet vad som är klart och vad som återstår.

Att förbereda en faktura ska vara ett eget steg. Att skicka den ska vara ett annat. Du ska kunna förstå vad nästa åtgärd innebär.

## 🔐 Din ekonomi, med tydlig kontroll

- **Du väljer företag.** Flera bolag ska kunna anslutas från början, och varje ändring ska göras i ett bestämt företag.
- **Du granskar bokföringsförslagen.** Standardläget för manuella verifikationer är ditt godkännande inne i AI-klienten. Installationsägaren ska kunna välja godkännandeläge per företag; AI-assistenten får inte ändra inställningen.
- **Felaktiga verifikationer ska stoppas.** Debet och kredit måste balansera, oavsett godkännandeläge.
- **Fortnox behåller bokföringen.** Verktyget ska använda Fortnox som den beständiga källan till ekonomiska uppgifter.

Granskningsflödet behöver verifieras i respektive AI-klient. Om klienten saknar stödet som ditt valda läge kräver ska bokföringen stoppas med en förklaring.

Relevanta uppgifter delas med den AI-klient du använder. Egen hosting av kopplingen innebär alltså inte att hela analysen sker lokalt.

## 🏢 Ett företag eller flera

Du ska kunna ansluta flera företag till samma installation och jämföra dem utan att blanda ihop bokföringen. Om du vill jämföra verksamhetsdelar inom samma företag behövs en uppdelning i underlaget, exempelvis med kostnadsställen.

Projektet är till för företagare i olika branscher, redovisningsbyråer och utvecklare. Samma grund ska fungera för dig som driver ett företag och för dig som arbetar med flera kundföretag.

## 🛠️ Så ska du komma igång

Du ska kunna köra kopplingen i din egen miljö, själv eller med hjälp av en utvecklare. En installationsguide och ett mindre webbgränssnitt ska hjälpa dig att ansluta företag och AI-assistent.

Du kommer att behöva:

- Fortnox med rätt program och behörigheter för dina funktioner.
- En egen Fortnox-integration och en plats där kopplingen kan köras.
- En AI-klient med rätt stöd. **ChatGPT prioriteras först, Claude därefter.**

Projektets egen programvara ska vara gratis. Fortnox, AI-klient och hosting kan ha egna kostnader.

**Vill du förbereda dig?** Läs [kom-igång-guiden](docs/users/kom-igang.sv.md) och [fler användarexempel](docs/users/exempel.sv.md). Installationskommandon kommer när det finns en testad version.

## 🤝 Var med och gör den användbar

Driver du företag eller hjälper företagare med ekonomin? Berätta vilket återkommande arbete du vill förenkla. Verkliga arbetsflöden hjälper oss att prioritera rätt. Använd påhittade uppgifter i publika exempel.

**Frågor, idéer och utvecklardiskussioner är välkomna på svenska och engelska.** Du kan bidra med erfarenheter, tester, guider eller kod. Koden och den tekniska referensdokumentationen skrivs på engelska.

*Contributions and discussions are welcome in both Swedish and English. Start with the [English developer README](README.en.md).*

👉 [Dela en idé eller ställ en fråga](https://github.com/alex-engvall/fortnox-mcp/discussions) · [Följ projektet](https://github.com/alex-engvall/fortnox-mcp) · [Bidra till utvecklingen](CONTRIBUTING.md)

---

Fortnox MCP är ett fristående, ideellt open source-projekt och ingen officiell Fortnox-produkt. Projektet licensieras under [AGPL-3.0-only](LICENSE). Se även [information om tredjepartsmaterial och namn](THIRD_PARTY_NOTICES.md).
