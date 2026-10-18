import { env } from "cloudflare:workers";
import { beforeEach, describe, expect, it } from "vitest";
import migration from "../../apps/worker/migrations/0001_execution_intents.sql?raw";
import installation from "../../apps/worker/src/installation.js";

const origin = "https://installation.example.invalid";

describe("public installation in workerd", () => {
  beforeEach(async () => {
    await env.DB.exec(migration.replace(/\n/g, " "));
  });

  it("reports migrated D1 without returning operational data", async () => {
    await env.DB.prepare(
      "INSERT OR REPLACE INTO execution_intents VALUES (?, ?, ?, ?, ?, ?)",
    )
      .bind(
        "synthetic_owner",
        "synthetic_company",
        "synthetic_id",
        "hash",
        1,
        "prepared",
      )
      .run();
    const response = await installation.fetch(
      new Request(`${origin}/health`),
      env,
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      runtime: "worker",
      database: "ready",
      fortnox: "disabled",
      remoteMcp: "disabled",
    });
    const page = await installation.fetch(new Request(`${origin}/setup`), env);
    expect(page.status).toBe(200);
    expect(page.headers.get("content-language")).toBe("sv");
    const html = await page.text();
    expect(html).toContain("Databasen svarar");
    expect(html).not.toContain("synthetic_owner");
    expect(html).not.toContain("synthetic_company");
    expect(html).not.toContain("synthetic_id");
  });

  it("returns an actionable failure when migrations have not run", async () => {
    await env.DB.exec("DROP TABLE execution_intents");
    const health = await installation.fetch(
      new Request(`${origin}/health`),
      env,
    );
    expect(health.status).toBe(503);
    expect(await health.json()).toMatchObject({
      ok: false,
      database: "unavailable",
    });
    const page = await installation.fetch(new Request(`${origin}/`), env);
    expect(page.status).toBe(503);
    const html = await page.text();
    expect(html).toContain("Databasen är inte redo");
    expect(html).not.toContain("D1_ERROR");
    expect(html).not.toContain("execution_intents");
  });

  it("does not accept an incompatible table as a completed migration", async () => {
    await env.DB.exec("DROP TABLE execution_intents");
    await env.DB.exec("CREATE TABLE execution_intents (id TEXT)");
    try {
      const health = await installation.fetch(
        new Request(`${origin}/health`),
        env,
      );
      expect(health.status).toBe(503);
    } finally {
      await env.DB.exec("DROP TABLE execution_intents");
    }
  });

  it("handles a missing binding without exposing configuration or an exception", async () => {
    const response = await installation.fetch(new Request(`${origin}/health`));
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({
      ok: false,
      database: "unavailable",
    });
  });

  it("renders English and limits arbitrary language input to fixed translations", async () => {
    const english = await installation.fetch(
      new Request(`${origin}/setup?lang=en`),
      env,
    );
    expect(english.headers.get("content-language")).toBe("en");
    expect(await english.text()).toContain("Your test installation");
    const unknown = await installation.fetch(
      new Request(`${origin}/setup?lang=%3Cscript%3E`),
      env,
    );
    expect(unknown.headers.get("content-language")).toBe("sv");
    expect(await unknown.text()).not.toContain("<script>");
  });

  it("blocks MCP on every host and method, including loopback", async () => {
    for (const host of [origin, "http://localhost"]) {
      for (const method of ["GET", "POST", "DELETE", "OPTIONS"]) {
        const response = await installation.fetch(
          new Request(`${host}/mcp`, { method }),
          env,
        );
        expect(response.status).toBe(403);
      }
    }
  });

  it("provides read-only routes and no secret or configuration endpoints", async () => {
    for (const path of ["/", "/setup", "/health"]) {
      const response = await installation.fetch(
        new Request(`${origin}${path}`, { method: "POST" }),
      );
      expect(response.status).toBe(405);
      expect(response.headers.get("allow")).toBe("GET, HEAD");
    }
    for (const path of [
      "/admin",
      "/.env",
      "/config",
      "/mcp/",
      "/oauth/authorize",
    ]) {
      expect(
        (await installation.fetch(new Request(`${origin}${path}`))).status,
      ).toBe(404);
    }
  });

  it("supports HEAD and prevents caching and embedded execution", async () => {
    for (const path of ["/", "/setup", "/health"]) {
      const response = await installation.fetch(
        new Request(`${origin}${path}`, { method: "HEAD" }),
        env,
      );
      expect(response.status).toBe(200);
      expect(await response.text()).toBe("");
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(response.headers.get("content-security-policy")).toContain(
        "frame-ancestors 'none'",
      );
      expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    }
  });
});
