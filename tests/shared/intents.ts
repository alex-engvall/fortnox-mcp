import type { IntentStore } from "@fortnox-mcp/core";
import { expect, it } from "vitest";

const context = { ownerId: "owner_a", companyId: "company_a" };
const input = { id: "intent_a", inputHash: "a".repeat(64), expiresAt: 10_000 };

// Shared observable contract exercised against real SQLite and workerd D1.
export function intentContract(open: () => Promise<IntentStore>): void {
  it("binds IDs to immutable input and expiry", async () => {
    const store = await open();
    expect((await store.prepare(context, input)).state).toBe("prepared");
    expect(await store.prepare(context, input)).toEqual(
      await store.get(context, input.id),
    );
    await expect(
      store.prepare(context, { ...input, inputHash: "b".repeat(64) }),
    ).rejects.toThrow("INTENT_CONFLICT");
    await expect(
      store.prepare(context, { ...input, expiresAt: 20_000 }),
    ).rejects.toThrow("INTENT_CONFLICT");
  });

  it("isolates owner and company on reads and transitions", async () => {
    const store = await open();
    await store.prepare(context, input);
    for (const other of [
      { ...context, companyId: "company_b" },
      { ...context, ownerId: "owner_b" },
    ]) {
      expect(await store.get(other, input.id)).toBeNull();
      expect(
        await store.transition(other, input.id, "prepared", "submitting", 1),
      ).toBe(false);
    }
    expect((await store.get(context, input.id))?.state).toBe("prepared");
  });

  it("allows exactly one concurrent claim", async () => {
    const store = await open();
    await store.prepare(context, input);
    const claims = await Promise.all(
      Array.from({ length: 20 }, () =>
        store.transition(context, input.id, "prepared", "submitting", 1),
      ),
    );
    expect(claims.filter(Boolean)).toHaveLength(1);
  });

  it("rejects expired claims but retains already submitted and unknown intents", async () => {
    const store = await open();
    await store.prepare(context, input);
    expect(
      await store.transition(
        context,
        input.id,
        "prepared",
        "submitting",
        input.expiresAt,
      ),
    ).toBe(false);
    await store.prepare(context, { ...input, id: "sent" });
    expect(
      await store.transition(context, "sent", "prepared", "submitting", 1),
    ).toBe(true);
    expect(
      await store.transition(
        context,
        "sent",
        "submitting",
        "outcome_unknown",
        20_000,
      ),
    ).toBe(true);
    await expect(
      store.transition(
        context,
        "sent",
        "outcome_unknown",
        "submitting",
        20_000,
      ),
    ).rejects.toThrow("VALIDATION_FAILED");
    expect((await store.get(context, "sent"))?.state).toBe("outcome_unknown");
    expect(
      await store.transition(
        context,
        "sent",
        "outcome_unknown",
        "succeeded",
        20_000,
      ),
    ).toBe(true);
    await expect(
      store.transition(context, "sent", "succeeded", "prepared", 20_000),
    ).rejects.toThrow("VALIDATION_FAILED");
  });

  it("preserves state when opening another adapter", async () => {
    const store = await open();
    await store.prepare(context, input);
    await store.transition(context, input.id, "prepared", "submitting", 1);
    const reopened = await open();
    expect((await reopened.get(context, input.id))?.state).toBe("submitting");
    expect(
      await reopened.transition(context, input.id, "prepared", "submitting", 2),
    ).toBe(false);
  });

  it("rejects invalid identifiers before SQL execution", async () => {
    const store = await open();
    await expect(
      store.prepare(context, {
        ...input,
        id: "';DROP TABLE execution_intents;--",
      }),
    ).rejects.toThrow();
    await store.prepare(context, input);
    expect(await store.get(context, input.id)).not.toBeNull();
  });
}
