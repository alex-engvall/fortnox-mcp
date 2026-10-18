import assert from "node:assert/strict";
import { test } from "node:test";
import {
  diagnosticWindow,
  type McpRequestDiagnostic,
} from "../src/diagnostics.js";

test("operator request diagnostics require a short deadline and expire with a per-isolate event bound", () => {
  let now = Date.UTC(2026, 9, 18);
  const clock = () => now;
  const until = new Date(now + 60000).toISOString();
  const events: McpRequestDiagnostic[] = [];
  const emit = (event: McpRequestDiagnostic) => {
    events.push(event);
  };
  assert.equal(diagnosticWindow(undefined, until, emit, clock), undefined);
  for (const deadline of [
    undefined,
    "garbage",
    new Date(now - 1).toISOString(),
    new Date(now + 16 * 60000).toISOString(),
  ])
    assert.equal(diagnosticWindow("true", deadline, emit, clock), undefined);
  const sink = diagnosticWindow("true", until, emit, clock);
  assert.ok(sink);
  const event: McpRequestDiagnostic = {
    method: "POST",
    contentType: "json",
    protocol: "2026-07-28",
    methods: ["tools/call"],
    authorization: "verified",
    transport: "modern",
    status: 200,
  };
  for (let i = 0; i < 100; i++) sink(event);
  assert.equal(events.length, 64);
  const expiring = diagnosticWindow("true", until, emit, clock);
  assert.ok(expiring);
  now += 60000;
  expiring(event);
  assert.equal(events.length, 64);
});
