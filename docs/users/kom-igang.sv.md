# Kom igång — förberedelser

**Det finns ännu ingen färdig Fortnox-koppling.** Du kan prova en första testinstallation av server och databas med knappen på [Installera-sidan](https://alex-engvall.github.io/fortnox-mcp/installera/). Flödet i ett nytt Cloudflare-konto är ännu inte verifierat. Testversionen ansluter inte till Fortnox eller ChatGPT; guiden nedan beskriver också kommande steg.

För utvecklare finns en lokal [S00-prototyp med syntetiska data](../../spikes/s00-mcp/README.md). Den läser inga Fortnox-uppgifter och kräver inga inloggningsuppgifter. Den verifierar inte en anslutning till ChatGPT och ska inte exponeras på internet. [Testresultat och återstående kontroller](../implementation/S00-spike-evidence.md) dokumenteras separat på engelska.

## Prova utvecklingsgrunden lokalt

Installera Node.js 24.19.0 och npm 11.9.0. Kör följande från projektets rot:

```sh
npm ci --ignore-scripts
npm test
npm run dev
```

Node-servern finns på `http://127.0.0.1:8787/mcp`. Det är en MCP-adress som tar emot protokollanrop, inte en webbsida. Stoppa med Ctrl+C. Använd `npm run dev:worker` för motsvarande lokala Worker-server. Verktyget `read_synthetic_status` tar endast emot `{"dataset":"s01"}` och returnerar syntetiska data. Ingen Fortnox- eller AI-inloggning behövs. Servern ska vara lokal; ChatGPT-anslutning och bokföringsfunktioner är ännu inte tillgängliga.

Fler utvecklingskommandon och begränsningar finns i [utvecklingsguiden](../development.md).

## Det behöver du

- En egen miljö för installationen, exempelvis Cloudflare eller en server.
- En AI-klient med det MCP-stöd som krävs. ChatGPT prioriteras först.
- Utvecklaråtkomst i Fortnox och en egen integration.
- Behörighet till de företag du vill ansluta samt rätt Fortnox-program och API-behörigheter.
- Ett testföretag för att prova inställningar och skrivfunktioner.

Projektets egen programvara ska vara gratis. Fortnox, AI-klient och hosting kan ha egna kostnader. Du behöver ingen separat modellnyckel för MCP-servern.

## Så ska installationen fungera

1. Installera den verifierade versionen och skapa din ägarinloggning.
2. Följ webbguide för att lägga in rätt återkopplingsadress i din Fortnox-integration.
3. Ange Client ID och Client Secret i den skyddade administrationen. Klistra aldrig in hemligheten i AI-chatten.
4. Välj funktioner och anslut företaget genom Fortnox egen inloggning och godkännande.
5. Kontrollera företagsnamn och organisationsnummer. Lägg till fler företag vid behov.
6. Välj hur manuella verifikationer ska godkännas för varje företag.
7. Anslut AI-klienten enligt installationsguiden och börja med läsning i testföretaget.

## Företag och godkännande

Skriv tydligt vilket företag du vill arbeta med. Du kan jämföra flera företag, men varje ändring ska ha ett bestämt målföretag.

Standardläget för manuella verifikationer är att du granskar och klickar för att bokföra inne i en klient som stöder flödet. Som ägare kan du välja att låta klientens vanliga godkännanden styra i stället. AI-verktygen får inte ändra det valet åt dig.

Oavsett läge ska obalanserade verifikationer och andra kontrollerade fel stoppas. Om klienten saknar det valda granskningsstödet ska bokföringen stoppas med en förklaring, inte gå vidare automatiskt.

## När något går fel

Saknad åtkomst kan bero på API-behörighet, Fortnox-licens eller användarrättigheter. Guiden ska visa vilken del som behöver åtgärdas. Nya API-behörigheter kan kräva en ny anslutning.

Om svaret försvinner efter en bokföring kan posten ändå ha skapats. Kontrollera då status innan du försöker igen. Vid flera kvitton ska du kunna se exakt vilka som lyckats, misslyckats eller fortfarande är osäkra.

Fortnox är den beständiga platsen för bokföring och sparade underlag. Servern ska inte bygga en parallell kopia av din bokföring.

Se [användarexemplen](exempel.sv.md) för planerade arbetsflöden. Alla exempel är mål för kommande implementation, inte besked om funktioner som redan finns.
