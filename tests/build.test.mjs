import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { test } from "node:test";
import installation from "../dist/installation.js";
import worker from "../dist/worker.js";

function syntheticRequest() {
  return new Request("http://127.0.0.1:8787/mcp", {
    method: "POST",
    headers: {
      accept: "application/json, text/event-stream",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name: "read_synthetic_status", arguments: { dataset: "s01" } },
    }),
  });
}

async function expectSyntheticResult(response) {
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(body.result.structuredContent, {
    dataset: "s01",
    synthetic: true,
    status: "ok",
  });
}

test("bundled Worker runs with dynamic code generation disabled in Node", async () => {
  await expectSyntheticResult(await worker.fetch(syntheticRequest()));
});

test("bundled installation reports missing storage and keeps remote MCP disabled", async () => {
  const health = await installation.fetch(
    new Request("https://installation.example.invalid/health"),
  );
  assert.equal(health.status, 503);
  assert.deepEqual(await health.json(), {
    ok: false,
    runtime: "worker",
    database: "unavailable",
    fortnox: "disabled",
    remoteMcp: "disabled",
  });
  const mcp = await installation.fetch(
    new Request("https://installation.example.invalid/mcp", { method: "POST" }),
  );
  assert.equal(mcp.status, 403);
});

test("built Node entry starts on loopback and serves the synthetic tool", {
  timeout: 10_000,
}, async (t) => {
  const child = spawn(process.execPath, ["dist/node.js"], {
    stdio: ["ignore", "pipe", "pipe"],
  });
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) {
      const exited = once(child, "exit");
      child.kill("SIGTERM");
      await exited;
    }
  });
  const started = await Promise.race([
    once(child.stdout, "data"),
    once(child, "exit").then(([code]) => {
      throw new Error(`Node entry exited before startup: ${code}`);
    }),
  ]);
  assert.match(String(started[0]), /server_started/);
  await expectSyntheticResult(await fetch(syntheticRequest()));
});
