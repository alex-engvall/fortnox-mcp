import { z } from "zod";

// G02 only: every field is synthetic and no provider adapter is reachable.
export const syntheticProposal = {
  company: { id: "s00-company-a", name: "Syntetiskt testföretag A" },
  fiscalYear: "2026",
  date: "2026-10-18",
  series: "TEST",
  description: "S00 – syntetiskt granskningsprov",
  currency: "SEK",
  receipt: "synthetic-receipt-1",
  rows: [
    { account: "TEST-DEBIT", debit: "125.00", credit: "0.00" },
    { account: "TEST-CREDIT", debit: "0.00", credit: "125.00" },
  ],
  debitTotal: "125.00",
  creditTotal: "125.00",
  difference: "0.00",
  warnings: ["Endast testdata. Ingen bokföring eller Fortnox-åtgärd utförs."],
} as const;

export const reviewSchema = `CREATE TABLE IF NOT EXISTS s00_review (
  id TEXT PRIMARY KEY, owner TEXT NOT NULL, company TEXT NOT NULL,
  proposal_hash TEXT NOT NULL, capability_hash TEXT NOT NULL,
  policy_version INTEGER NOT NULL, expires INTEGER NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('prepared', 'consumed'))
)`;

export interface ReviewRecord {
  id: string;
  owner: string;
  company: string;
  proposalHash: string;
  capabilityHash: string;
  policyVersion: number;
  expires: number;
}
export interface ReviewStore {
  insert(record: ReviewRecord, now: number): Promise<boolean>;
  consume(record: ReviewRecord, now: number): Promise<boolean>;
}

export const insertReviewSql = `INSERT INTO s00_review
  (id, owner, company, proposal_hash, capability_hash, policy_version, expires, state)
  SELECT ?, ?, ?, ?, ?, ?, ?, 'prepared'
  WHERE (SELECT count(*) FROM s00_review WHERE owner = ? AND expires > ?) < 32`;
export const consumeReviewSql = `UPDATE s00_review SET state = 'consumed'
  WHERE id = ? AND owner = ? AND company = ? AND proposal_hash = ?
  AND capability_hash = ? AND policy_version = ? AND expires = ?
  AND expires > ? AND state = 'prepared'`;
export function reviewValues(record: ReviewRecord) {
  return [
    record.id,
    record.owner,
    record.company,
    record.proposalHash,
    record.capabilityHash,
    record.policyVersion,
    record.expires,
  ] as const;
}

export function d1ReviewStore(db: D1Database): ReviewStore {
  return {
    async insert(record, now) {
      // Synthetic-only metadata. Bound both retention and outstanding proposals.
      await db
        .prepare("DELETE FROM s00_review WHERE expires <= ?")
        .bind(now)
        .run();
      const result = await db
        .prepare(insertReviewSql)
        .bind(...reviewValues(record), record.owner, now)
        .run();
      return result.meta.changes === 1;
    },
    async consume(record, now) {
      const result = await db
        .prepare(consumeReviewSql)
        .bind(...reviewValues(record), now)
        .run();
      return result.meta.changes === 1;
    },
  };
}

async function sha256(text: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return [...new Uint8Array(digest)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}
export const reviewCommitSchema = z
  .object({
    proposalId: z.uuid(),
    proposalHash: z.string().regex(/^[0-9a-f]{64}$/),
    capability: z.string().regex(/^[0-9a-f]{64}$/),
    expires: z.number().int().positive(),
  })
  .strict();

export function reviewService(
  store: ReviewStore,
  owner: string,
  now = Date.now,
) {
  return {
    async prepare() {
      const capability = [...crypto.getRandomValues(new Uint8Array(32))]
        .map((value) => value.toString(16).padStart(2, "0"))
        .join("");
      const record: ReviewRecord = {
        id: crypto.randomUUID(),
        owner,
        company: syntheticProposal.company.id,
        proposalHash: await sha256(JSON.stringify(syntheticProposal)),
        capabilityHash: await sha256(capability),
        policyVersion: 1,
        expires: now() + 10 * 60_000,
      };
      if (!(await store.insert(record, now()))) throw new Error("REVIEW_LIMIT");
      return {
        proposal: syntheticProposal,
        proposalId: record.id,
        proposalHash: record.proposalHash,
        expires: record.expires,
        // This goes ONLY in result _meta, never text/structuredContent.
        capability,
      };
    },
    async commit(input: unknown) {
      const parsed = reviewCommitSchema.safeParse(input);
      if (!parsed.success) return { accepted: false as const };
      const args = parsed.data;
      const expectedHash = await sha256(JSON.stringify(syntheticProposal));
      if (args.proposalHash !== expectedHash)
        return { accepted: false as const };
      const accepted = await store.consume(
        {
          id: args.proposalId,
          owner,
          company: syntheticProposal.company.id,
          proposalHash: expectedHash,
          capabilityHash: await sha256(args.capability),
          policyVersion: 1,
          expires: args.expires,
        },
        now(),
      );
      return { accepted, fortnoxEnabled: false as const };
    },
  };
}
