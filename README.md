# Fortnox MCP 🧩

[English developer README](README.en.md) · [Kom igång](docs/users/kom-igang.sv.md) · [Frågor och idéer](https://github.com/alex-engvall/fortnox-mcp/discussions)

**Mer tid för gästerna. Bättre koll på restaurangens ekonomi.**

Kvitton från veckans inköp, fakturor till cateringkunder och en hög med leverantörsfakturor. Restaurangens administration fortsätter även när sista gästen har gått hem.

Fortnox MCP är ett öppet projekt som ska göra det enklare att ta hand om ekonomin direkt från din AI-assistent. Fråga om kostnaderna, få hjälp med underlagen och förbered nästa steg med uppgifter från ditt Fortnox.

![Illustration av en restaurangägare som går igenom kvitton vid en dator i sin restaurang.](docs/assets/restaurant-owner.webp)

> 🚧 **Under utveckling.** Dokumentationsgrunden och byggplanen är klara. Det finns ännu ingen färdig installation. Exemplen nedan visar vad vi vill göra möjligt; illustrationen visar en tänkt arbetssituation.

## 💬 Börja med det du behöver hjälp med

Du ska kunna skriva som du skulle prata med en kollega. Här är några exempel på planerade arbetsflöden:

| I restaurangens vardag | Så kan du be om hjälp |
| --- | --- |
| **Förstå inköpen** | ”Jämför våra bokförda varuinköp i september med augusti. Vilka leverantörer står för de största förändringarna?” |
| **Få ordning på kvittona** | ”Här är åtta kvitton från veckans inköp. Förbered bokföringsförslag och markera det jag behöver komplettera.” |
| **Fakturera catering** | ”Förbered en faktura för cateringuppdraget utifrån det här underlaget. Visa förslaget innan vi går vidare.” |
| **Planera kommande betalningar** | ”Vilka leverantörsfakturor förfaller de närmaste två veckorna? Visa också öppna kundfakturor och bokförda bank- och kassasaldon.” |
| **Följa flera bolag** | ”Jämför intäkter och kostnader för mina två restaurangbolag den här månaden. Visa bolagen var för sig.” |

Analyserna ska utgå från uppgifterna i Fortnox och visa var siffrorna kommer ifrån. Bokförda bankbelopp kan skilja sig från saldot hos banken. Försäljning per maträtt, svinn och faktisk råvaruförbrukning kräver mer underlag än enbart bokförda inköp.

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

## 🏢 En restaurang eller flera

Du ska kunna ansluta flera restaurangbolag till samma installation och jämföra dem med separat bokföring. Om flera restauranger ligger i samma bolag behövs en uppdelning i underlaget, exempelvis med kostnadsställen, för att analysera dem var för sig.

Restaurangexemplen är en utgångspunkt. Projektet är också till för andra företagare, redovisningsbyråer och utvecklare.

## 🛠️ Så ska du komma igång

Du ska kunna köra kopplingen i din egen miljö, själv eller med hjälp av en utvecklare. En installationsguide och ett mindre webbgränssnitt ska hjälpa dig att ansluta företag och AI-assistent.

Du kommer att behöva:

- Fortnox med rätt program och behörigheter för dina funktioner.
- En egen Fortnox-integration och en plats där kopplingen kan köras.
- En AI-klient med rätt stöd. **ChatGPT prioriteras först, Claude därefter.**

Projektets egen programvara ska vara gratis. Fortnox, AI-klient och hosting kan ha egna kostnader.

**Vill du förbereda dig?** Läs [kom-igång-guiden](docs/users/kom-igang.sv.md) och [fler användarexempel](docs/users/exempel.sv.md). Installationskommandon kommer när det finns en testad version.

## 🤝 Var med och gör den användbar

Driver du restaurang eller hjälper restauranger med ekonomin? Berätta vilket återkommande arbete du vill förenkla. Verkliga arbetsflöden hjälper oss att prioritera rätt. Använd påhittade uppgifter i publika exempel.

**Frågor, idéer och utvecklardiskussioner är välkomna på svenska och engelska.** Du kan bidra med erfarenheter, tester, guider eller kod. Koden och den tekniska referensdokumentationen skrivs på engelska.

*Contributions and discussions are welcome in both Swedish and English. Start with the [English developer README](README.en.md).*

👉 [Dela en idé eller ställ en fråga](https://github.com/alex-engvall/fortnox-mcp/discussions) · [Följ projektet](https://github.com/alex-engvall/fortnox-mcp) · [Bidra till utvecklingen](CONTRIBUTING.md)

---

Fortnox MCP är ett fristående, ideellt open source-projekt och ingen officiell Fortnox-produkt. Projektet licensieras under [AGPL-3.0-only](LICENSE). Se även [information om tredjepartsmaterial och namn](THIRD_PARTY_NOTICES.md).
