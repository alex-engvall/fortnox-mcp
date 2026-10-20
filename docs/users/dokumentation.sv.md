# Sök i Fortnox-dokumentationen lokalt

Dokumentationsverktygen hjälper dig att hitta API-guider och förstå vilka
operationer Fortnox beskriver. De hämtar inga företagsuppgifter och gör inga
ändringar i Fortnox.

Kör från projektets rotmapp, där `package.json` finns:

```powershell
npm ci --ignore-scripts
npm run dev:docs
```

Anslut en lokal MCP-klient till `http://127.0.0.1:8787/mcp` med Streamable HTTP.
Det här är en lokal utvecklingsversion; den är ännu inte en anslutning från
ChatGPT till den driftsatta Cloudflare-servern.

Guiderna fungerar direkt. För API-referensen lägger du din tillåtna
specifikationsfil i `vendor-specs/fortnox/openapi.json`, eller anger sökvägen
som `FORTNOX_OPENAPI_PATH` i projektets lokala `.env`-fil. Starta sedan om servern.
Filen hålls utanför Git och läses bara vid uppstart. Om du uttryckligen anger en
saknad eller ogiltig fil stannar starten med ett fel.

Exempel på verktygsanrop:

```json
{"query":"verifikation","kind":"operation"}
```

Använd det med `search_api_docs`. Andra sökningar är `OAuth`, `saknade
behörigheter` och `fakturarader`. Läs en träff med `read_api_doc` och dess
`doc_id`. Stora scheman delas upp; använd svarets `continuation` som `cursor`
för att läsa vidare med samma dokument-ID och sektion.

Svaren visar officiell referenslänk och källuppgifter. Saknas specifikationen
visas API-referensen som otillgänglig, medan guiderna går att använda. Att en
operation finns beskriven betyder inte att vårt MCP-projekt kan utföra den.

Se [utvecklarguiden](../developer-tools.md) för gränser och felsökning.
