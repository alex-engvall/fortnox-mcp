# Kom igång — förberedelser

**Det finns ännu ingen färdig Fortnox-koppling.** Du kan prova en första testinstallation av server och databas med knappen på [Installera-sidan](https://alex-engvall.github.io/fortnox-mcp/installera/). Installation, databasmigrering och statuskontroll har verifierats i ett befintligt Cloudflare-konto den 18 oktober 2026. Helt nya konton, egna resursnamn, återdriftsättning och borttagning återstår att testa. Testversionen ansluter inte till Fortnox eller ChatGPT; guiden nedan beskriver också kommande steg.

## Prova testinstallationen i Cloudflare

1. Logga in i Cloudflare med kontoägarens användare och välj kontot där du vill installera. Kontrollera både e-postadressen i användarmenyn och din roll under **Manage account → Members**. Det verifierade flödet använde **Super Administrator - All Privileges** för hela kontot. Att välja ägarens konto ger inte en inbjuden användare högre behörighet.
2. Öppna [Installera-sidan](https://alex-engvall.github.io/fortnox-mcp/installera/) och anslut GitHub när Cloudflare ber om det. Välj **Only select repositories** för appen **Cloudflare Workers and Pages** och markera projektet. När Cloudflare skapar din kodkopia kan den också läggas till automatiskt i appens åtkomst; kontrollera listan efter installationen.
3. Välj namn för kodkopian, Workern och D1-databasen. Behåll `npm run build` och `npm run deploy`. Det senare kommandot förbereder databasen innan servern publiceras. Standardnamnen är verifierade; andra namn återstår att testa.
4. Vänta på en lyckad byggning och driftsättning. Öppna Worker-adressen och kontrollera att sidan visar **Servern svarar.** och **Databasen svarar och grundtabellen finns.** Spara adressen.

Du behöver inga Fortnox-uppgifter eller någon modellnyckel för testet. Din kodkopia uppdateras inte automatiskt från projektet. Se [uppdatering och avslut av testet](../deployment.md#first-cloudflare-test-installation) och [testprotokollet](../implementation/S11-cloudflare-evidence.md#hosted-installation-verification--2026-10-18).

### Om GitHub-anslutningen misslyckas

Vid **Error connecting to git account**, börja med Cloudflare-inloggningen och kontobehörigheten. Rollen **Domain Administrator** ger enligt [Cloudflares dokumentation](https://developers.cloudflare.com/fundamentals/manage-members/roles/#domain-scoped-roles) bara läsåtkomst till Workers på kontonivå. Den räckte inte i det observerade flödet. Byggkommandona och databasen har ännu inte körts i det steget.

En installerad GitHub-app betyder inte att Cloudflare har registrerat anslutningen. När rätt kontoägare är inloggad ska GitHub-kontot synas bland Cloudflares anslutna konton. Om det fortfarande saknas och GitHub bara visar appens inställningar kan en ny appkoppling behövas.

Kontrollera först vilka repon och byggningar appen används till. Att avinstallera **Cloudflare Workers and Pages** stoppar nya byggningar för alla projekt som använder den installationen; befintliga driftsättningar ligger kvar. Om avbrottet är acceptabelt, ta bort just den appinstallationen i GitHub och starta anslutningen igen från installationsknappen med rätt Cloudflare-inloggning. Välj bara de repon som behövs. Avinstallera inte upprepade gånger utan att först rätta konto och behörighet. [Fler detaljer finns i driftsättningsguiden](../deployment.md#github-connection-fails-before-the-build).

## Prova utvecklingsgrunden lokalt

En separat [OAuth-prototyp för utvecklare](../../spikes/s00-oauth/README.md) provar
inloggning och behörigheter med ett syntetiskt läsverktyg. Den är skild från
testinstallationen ovan. Node och lokala Workers/D1-tester finns; verkligt
samtycke och verktygsanrop i ChatGPT återstår att verifiera. Engångskoder skapas
lokalt av operatören, gäller i fem minuter och ska aldrig klistras in i en chatt.

För utvecklare finns en lokal [S00-prototyp med syntetiska data](../../spikes/s00-mcp/README.md). Den läser inga Fortnox-uppgifter och kräver inga inloggningsuppgifter. Den verifierar inte en anslutning till ChatGPT och ska inte exponeras på internet. [Testresultat och återstående kontroller](../implementation/S00-spike-evidence.md) dokumenteras separat på engelska.

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
