import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { convertV4MiniflareOptions, Miniflare } from "miniflare";
import {
  d1ReviewStore,
  type ReviewStore,
  reviewSchema,
  reviewService,
} from "../src/review.js";
import { sqliteReviewStore } from "../src/review-sqlite.js";
import { createProbeServer } from "../src/server.js";

async function isolationAndReplay(store: ReviewStore) {
  let now = 1_000_000;
  const owner = reviewService(store, "owner-a", () => now);
  const other = reviewService(store, "owner-b", () => now);
  const prepared = await owner.prepare();
  const input = {
    proposalId: prepared.proposalId,
    proposalHash: prepared.proposalHash,
    capability: prepared.capability,
    expires: prepared.expires,
  };
  assert.equal(
    (
      await owner.commit({
        ...input,
        capability: "0".repeat(64),
        confirmed: true,
        origin: "ui",
      })
    ).accepted,
    false,
  );
  assert.equal(
    (await owner.commit({ ...input, capability: "0".repeat(64) })).accepted,
    false,
  );
  assert.equal((await other.commit(input)).accepted, false);
  assert.equal(
    (await owner.commit({ ...input, proposalHash: "0".repeat(64) })).accepted,
    false,
  );
  assert.equal(
    (await owner.commit({ ...input, rows: [{ debit: "999.00" }] })).accepted,
    false,
  );
  assert.equal(
    (await owner.commit({ ...input, expires: input.expires + 1 })).accepted,
    false,
  );
  const results = await Promise.all([owner.commit(input), owner.commit(input)]);
  assert.equal(results.filter((result) => result.accepted).length, 1);
  assert.equal((await owner.commit(input)).accepted, false);
  const expired = await owner.prepare();
  now = expired.expires;
  assert.equal(
    (
      await owner.commit({
        proposalId: expired.proposalId,
        proposalHash: expired.proposalHash,
        capability: expired.capability,
        expires: expired.expires,
      })
    ).accepted,
    false,
  );
}

test("review binds owner, immutable hash, expiry and one-time claim in SQLite", async () => {
  const db = new DatabaseSync(":memory:");
  db.exec(reviewSchema);
  try {
    await isolationAndReplay(sqliteReviewStore(db));
    const service = reviewService(sqliteReviewStore(db), "policy-owner");
    const prepared = await service.prepare();
    db.exec(
      "UPDATE s00_review SET policy_version = 2 WHERE owner = 'policy-owner'",
    );
    assert.equal(
      (
        await service.commit({
          proposalId: prepared.proposalId,
          proposalHash: prepared.proposalHash,
          capability: prepared.capability,
          expires: prepared.expires,
        })
      ).accepted,
      false,
    );
    db.exec(
      "UPDATE s00_review SET policy_version = 1, company = 'other-company' WHERE owner = 'policy-owner'",
    );
    assert.equal(
      (
        await service.commit({
          proposalId: prepared.proposalId,
          proposalHash: prepared.proposalHash,
          capability: prepared.capability,
          expires: prepared.expires,
        })
      ).accepted,
      false,
    );
    const bounded = reviewService(sqliteReviewStore(db), "bounded-owner");
    for (let count = 0; count < 32; count++) await bounded.prepare();
    await assert.rejects(bounded.prepare(), /REVIEW_LIMIT/);
  } finally {
    db.close();
  }
});

test("review uses the same atomic claim and isolation in actual local D1", async () => {
  const mf = new Miniflare(
    convertV4MiniflareOptions({
      name: "s00-review-test",
      modules: true,
      script: "export default {fetch(){return new Response('synthetic')}}",
      d1Databases: ["REVIEW_DB"],
    }),
  );
  try {
    const db = await mf.getD1Database("REVIEW_DB");
    await db.prepare(reviewSchema).run();
    await isolationAndReplay(d1ReviewStore(db as unknown as D1Database));
  } finally {
    await mf.dispose();
  }
});

test("MCP review capability stays out of model results and commit is app-only", async () => {
  const db = new DatabaseSync(":memory:");
  db.exec(reviewSchema);
  const server = createProbeServer({
    store: sqliteReviewStore(db),
    owner: "owner-a",
    authorized: true,
  });
  const client = new Client({ name: "synthetic-test", version: "0" });
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  try {
    await server.connect(serverTransport);
    await client.connect(clientTransport);
    const catalog = await client.listTools();
    const commit = catalog.tools.find(
      (tool) => tool.name === "commit_synthetic_review",
    );
    assert.deepEqual(commit?._meta?.ui, { visibility: ["app"] });
    const prepared = await client.callTool({
      name: "prepare_synthetic_review",
      arguments: {},
    });
    const privateData = prepared._meta?.s00Review as Record<string, unknown>;
    assert.equal(typeof privateData.capability, "string");
    assert.ok(
      !JSON.stringify({
        content: prepared.content,
        structuredContent: prepared.structuredContent,
      }).includes(String(privateData.capability)),
    );
    const forged = await client.callTool({
      name: "commit_synthetic_review",
      arguments: { confirmed: true, origin: "ui" },
    });
    assert.equal(forged.isError, true);
    const committed = await client.callTool({
      name: "commit_synthetic_review",
      arguments: privateData,
    });
    assert.deepEqual(committed.structuredContent, {
      accepted: true,
      fortnoxEnabled: false,
    });
    const replay = await client.callTool({
      name: "commit_synthetic_review",
      arguments: privateData,
    });
    assert.deepEqual(replay.structuredContent, {
      accepted: false,
      fortnoxEnabled: false,
    });
  } finally {
    await client.close();
    await server.close();
    db.close();
  }
});

test("MCP review callbacks require the separately granted review scope", async () => {
  const db = new DatabaseSync(":memory:");
  db.exec(reviewSchema);
  const server = createProbeServer({
    store: sqliteReviewStore(db),
    owner: "owner-a",
    authorized: false,
  });
  const client = new Client({ name: "read-only-client", version: "0" });
  const [a, b] = InMemoryTransport.createLinkedPair();
  try {
    await server.connect(b);
    await client.connect(a);
    const result = await client.callTool({
      name: "prepare_synthetic_review",
      arguments: {},
    });
    assert.equal(result.isError, true);
    assert.ok(!result._meta);
    const status = await client.callTool({
      name: "read_synthetic_status",
      arguments: {},
    });
    assert.deepEqual(status.structuredContent, {
      dataset: "s00-oauth",
      authenticated: true,
      fortnoxEnabled: false,
    });
  } finally {
    await client.close();
    await server.close();
    db.close();
  }
});
