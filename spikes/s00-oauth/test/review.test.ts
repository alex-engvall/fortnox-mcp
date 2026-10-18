import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
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
  const reference = {
    proposalId: input.proposalId,
    proposalHash: input.proposalHash,
    expires: input.expires,
  };
  assert.deepEqual(await owner.status(reference), {
    status: "prepared",
    fortnoxEnabled: false,
  });
  assert.equal((await other.status(reference)).status, "unavailable");
  assert.equal(
    (await owner.status({ ...reference, proposalHash: "0".repeat(64) })).status,
    "unavailable",
  );
  assert.equal(
    (await owner.status({ ...reference, expires: reference.expires + 1 }))
      .status,
    "unavailable",
  );
  assert.equal(
    (await owner.status(input)).status,
    "unavailable",
    "status never accepts capability material",
  );
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
  assert.deepEqual(await owner.status(reference), {
    status: "consumed",
    fortnoxEnabled: false,
  });
  assert.ok(
    !JSON.stringify(await owner.status(reference)).includes(input.capability),
  );
  assert.equal((await owner.commit(input)).accepted, false);
  const expired = await owner.prepare();
  now = expired.expires;
  assert.equal(
    (
      await owner.status({
        proposalId: expired.proposalId,
        proposalHash: expired.proposalHash,
        expires: expired.expires,
      })
    ).status,
    "expired",
  );
  assert.equal(
    (await owner.status(reference)).status,
    "consumed",
    "expiry cannot undo a consumed record",
  );
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
    const reference = {
      proposalId: prepared.proposalId,
      proposalHash: prepared.proposalHash,
      expires: prepared.expires,
    };
    assert.equal((await service.status(reference)).status, "unavailable");
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
    assert.equal((await service.status(reference)).status, "unavailable");
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

test("consumed status survives a SQLite restart and lost store responses stay unknown until read", async () => {
  const directory = await mkdtemp(join(tmpdir(), "s00-review-"));
  const path = join(directory, "review.sqlite");
  let db = new DatabaseSync(path);
  try {
    db.exec(reviewSchema);
    const store = sqliteReviewStore(db);
    const service = reviewService(
      {
        ...store,
        async consume(record, now) {
          await store.consume(record, now);
          throw new Error("synthetic lost database response");
        },
      },
      "owner-a",
    );
    const prepared = await service.prepare();
    const { proposal: _proposal, capability, ...reference } = prepared;
    await assert.rejects(service.commit({ ...reference, capability }));
    assert.equal((await service.status(reference)).status, "consumed");
    db.close();
    db = new DatabaseSync(path);
    const restored = reviewService(sqliteReviewStore(db), "owner-a");
    assert.equal((await restored.status(reference)).status, "consumed");
    assert.equal(
      (await restored.commit({ ...reference, capability })).accepted,
      false,
    );
    await db.prepare("DELETE FROM s00_review").run();
    assert.equal(
      (await restored.status(reference)).status,
      "unavailable",
      "missing state does not prove a commit failed",
    );
  } finally {
    db.close();
    await rm(directory, { recursive: true, force: true });
  }
});

test("MCP review capability stays out of model results and commit is app-only", async () => {
  const db = new DatabaseSync(":memory:");
  db.exec(reviewSchema);
  const server = createProbeServer({
    origin: "https://probe.example.invalid",
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
    const statusTool = catalog.tools.find(
      (tool) => tool.name === "read_synthetic_review_status",
    );
    assert.deepEqual(statusTool?._meta?.ui, { visibility: ["app"] });
    assert.equal(statusTool?.annotations?.readOnlyHint, true);
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
    const { capability: _capability, ...reference } = privateData;
    const status = await client.callTool({
      name: "read_synthetic_review_status",
      arguments: reference,
    });
    assert.deepEqual(status.structuredContent, {
      status: "consumed",
      fortnoxEnabled: false,
    });
    assert.equal(status._meta, undefined);
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
    origin: "https://probe.example.invalid",
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
    assert.equal(result._meta?.s00Review, undefined);
    for (const name of [
      "commit_synthetic_review",
      "read_synthetic_review_status",
    ]) {
      const args = {
        proposalId: crypto.randomUUID(),
        proposalHash: "0".repeat(64),
        expires: Date.now() + 60000,
      };
      const denied = await client.callTool({
        name,
        arguments:
          name === "commit_synthetic_review"
            ? { ...args, capability: "0".repeat(64) }
            : args,
      });
      assert.equal(denied.isError, true);
      assert.ok(denied._meta?.["mcp/www_authenticate"]);
    }
    assert.deepEqual(result._meta?.["mcp/www_authenticate"], [
      'Bearer resource_metadata="https://probe.example.invalid/.well-known/oauth-protected-resource/mcp", error="insufficient_scope", error_description="Authorize the synthetic review scope", scope="mcp:read offline_access mcp:review"',
    ]);
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
