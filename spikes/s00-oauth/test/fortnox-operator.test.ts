import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { request } from "node:http";
import { tmpdir } from "node:os";
import { basename, isAbsolute, join, relative, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

test("local Fortnox operator refuses DNS rebinding, cross-origin/forged forms and callback without its session", async () => {
  const root = await mkdtemp(join(tmpdir(), "s00-fortnox-"));
  await mkdir(join(root, ".data"));
  await writeFile(
    join(root, ".data/fortnox-operator.json"),
    JSON.stringify({
      clientId: "synthetic-client",
      testTenantId: "9000001",
      testName: "Synthetic sandbox",
    }),
  );
  const child = spawn(
    process.execPath,
    [
      fileURLToPath(
        new URL("../node_modules/tsx/dist/cli.mjs", import.meta.url),
      ),
      fileURLToPath(new URL("../src/fortnox-operator.ts", import.meta.url)),
    ],
    { cwd: root, stdio: ["ignore", "pipe", "pipe"], windowsHide: true },
  );
  const exited = once(child, "exit");
  try {
    await Promise.race([
      new Promise<void>((resolve) => {
        // Keep draining: breaking an async stream iterator destroys the pipe
        // and would terminate the child when a later safe diagnostic is logged.
        child.stdout.on("data", (chunk) => {
          if (chunk.toString().includes("Local Fortnox test ready")) resolve();
        });
      }),
      new Promise<never>((_, reject) => {
        const timer = setTimeout(
          () => reject(new Error("Operator startup timeout")),
          10_000,
        );
        timer.unref();
      }),
    ]);
    const base = "http://localhost:8789";
    const home = await fetch(base);
    assert.equal(home.status, 200);
    assert.equal(home.headers.get("cache-control"), "no-store");
    assert.equal(home.headers.get("referrer-policy"), "same-origin");
    const cookie = home.headers.get("set-cookie")?.split(";")[0] as string;
    assert.match(cookie, /^s00_fortnox=/);
    const html = await home.text();
    const csrf = /name="csrf" value="([A-Za-z0-9_-]+)"/.exec(
      html,
    )?.[1] as string;
    assert.ok(csrf);
    assert.equal(
      (await fetch(`${base}/callback?code=fixture&state=fixture`)).status,
      403,
    );
    assert.equal(
      await new Promise<number | undefined>((resolve, reject) => {
        const rebinding = request(
          base,
          { headers: { Host: "untrusted.invalid:8789" } },
          (response) => {
            response.resume();
            resolve(response.statusCode);
          },
        );
        rebinding.on("error", reject);
        rebinding.end();
      }),
      403,
    );
    const body = new URLSearchParams({
      mode: "service",
      secret: "synthetic-secret",
      csrf,
    });
    const headers = { Cookie: cookie, Origin: "https://untrusted.invalid" };
    assert.equal(
      (await fetch(`${base}/start`, { method: "POST", headers, body })).status,
      403,
    );
    headers.Origin = "null";
    assert.equal(
      (await fetch(`${base}/start`, { method: "POST", headers, body })).status,
      403,
    );
    headers.Origin = base;
    const check = await fetch(`${base}/check`, {
      method: "POST",
      headers,
      body: new URLSearchParams({ csrf }),
    });
    assert.equal(check.status, 200);
    assert.match(await check.text(), /sessionen är kontrollerad och fungerar/);
    body.set("csrf", "forged");
    assert.equal(
      (await fetch(`${base}/start`, { method: "POST", headers, body })).status,
      403,
    );
    body.set("csrf", csrf);
    body.set("secret", "x".repeat(9000));
    assert.equal(
      (await fetch(`${base}/start`, { method: "POST", headers, body })).status,
      413,
    );
    body.set("secret", "synthetic-secret");
    const start = await fetch(`${base}/start`, {
      method: "POST",
      headers,
      body,
      redirect: "manual",
    });
    assert.equal(start.status, 303);
    const location = new URL(start.headers.get("location") as string);
    assert.equal(location.origin, "https://apps.fortnox.se");
    assert.equal(location.searchParams.get("account_type"), "service");
    assert.equal(location.href.includes("synthetic-secret"), false);
    assert.equal(
      (await fetch(`${base}/start`, { method: "POST", headers, body })).status,
      409,
    );
    const stop = await fetch(`${base}/stop`, {
      method: "POST",
      headers,
      body: new URLSearchParams({ csrf }),
    });
    assert.equal(stop.status, 200);
    await exited;
  } finally {
    if (child.exitCode === null) {
      child.kill();
      await exited;
    }
    const target = resolve(root);
    const withinTemp = relative(resolve(tmpdir()), target);
    assert.ok(
      withinTemp && !withinTemp.startsWith("..") && !isAbsolute(withinTemp),
    );
    assert.ok(basename(target).startsWith("s00-fortnox-"));
    await rm(target, { recursive: true, force: true });
  }
});
