const styles = `
  :root { color-scheme: light; font: 18px/1.6 system-ui, sans-serif; color: #152d32; background: #fff7ed; }
  * { box-sizing: border-box; }
  body { margin: 0; }
  header { background: #244e57; color: #fff7ed; padding: 24px; }
  header div, main, footer { max-width: 800px; margin: auto; }
  header div { display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
  header a { padding: 8px 0; }
  a { color: inherit; text-underline-offset: .2em; }
  a:focus-visible { outline: 3px solid currentColor; outline-offset: 5px; }
  main { padding: 40px 24px; }
  h1 { font-size: clamp(32px, 6vw, 52px); line-height: 1.1; letter-spacing: -.04em; }
  h2 { margin-top: 36px; font-size: 26px; line-height: 1.3; }
  dt { font-weight: 650; }
  dl > div { padding: 16px 0; border-bottom: 1px solid #d8c6b4; }
  dd { margin: 4px 0 0; }
  .action { display: inline-block; background: #244e57; color: white; border-radius: 5px; padding: 12px 20px; text-decoration: none; }
  .action:hover { background: #152d32; }
  footer { padding: 0 24px 32px; font-size: 15px; }
`;

export function installationPage(
  databaseReady: boolean,
  language: "sv" | "en" = "sv",
): string {
  const swedish = language === "sv";
  const title = swedish ? "Din testinstallation" : "Your test installation";
  const databaseStatus = databaseReady
    ? swedish
      ? "Databasen svarar och grundtabellen finns."
      : "The database responds and the foundation table exists."
    : swedish
      ? "Databasen är inte redo. Kontrollera att installationen är klar och att databassteget lyckades i Cloudflare."
      : "The database is not ready. Check that deployment has finished and the database step succeeded in Cloudflare.";

  // Every interpolated value is a fixed translation or a boolean-derived status.
  return `<!doctype html>
<html lang="${language}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <title>${title} – Fortnox MCP</title>
    <style>${styles}</style>
  </head>
  <body>
    <header><div><strong>Fortnox MCP</strong><a href="?lang=${swedish ? "en" : "sv"}" lang="${swedish ? "en" : "sv"}">${swedish ? "English" : "Svenska"}</a></div></header>
    <main>
      <h1>${title}</h1>
      <p>${swedish ? "Det här är ett första test av din egen Cloudflare-miljö. Du behöver inga Fortnox-uppgifter eller någon modellnyckel för testet." : "This is a first test of your own Cloudflare environment. No Fortnox credentials or model API key are needed."}</p>
      <dl>
        <div><dt>Cloudflare Worker</dt><dd>${swedish ? "Servern svarar." : "The server responds."}</dd></div>
        <div><dt>Cloudflare D1</dt><dd>${databaseStatus}</dd></div>
        <div><dt>Fortnox</dt><dd>${swedish ? "Inte anslutet. Inga företagsuppgifter läses eller ändras." : "Not connected. No company data is read or changed."}</dd></div>
        <div><dt>ChatGPT / MCP</dt><dd>${swedish ? "Inte tillgängligt i den här testversionen. Kräver kommande inloggning och klientverifiering." : "Unavailable in this test version. Requires future authentication and client verification."}</dd></div>
      </dl>
      <p><a class="action" href="?lang=${language}">${swedish ? "Kontrollera igen" : "Check again"}</a></p>
      <h2>${swedish ? "Vad händer härnäst?" : "What comes next?"}</h2>
      <p>${swedish ? "Nästa steg är skyddad ägarinloggning, anslutning till ditt Fortnox-testföretag och verifierade instruktioner för ChatGPT. När en version med de funktionerna finns uppdaterar du din installation enligt guiden." : "Next are secure owner login, connection to your Fortnox test company and verified ChatGPT instructions. When a version with those features is available, update your installation using the guide."}</p>
      <p><a href="https://alex-engvall.github.io/fortnox-mcp/installera/">${swedish ? "Till installationsguiden" : "Installation guide (Swedish)"}</a></p>
    </main>
    <footer><a href="https://github.com/alex-engvall/fortnox-mcp">${swedish ? "Källkod och licens (AGPL-3.0-only)" : "Source and license (AGPL-3.0-only)"}</a><p>${swedish ? "Ett självständigt projekt. Ingen officiell Fortnox-produkt." : "An independent project. Not an official Fortnox product."}</p></footer>
  </body>
</html>`;
}
