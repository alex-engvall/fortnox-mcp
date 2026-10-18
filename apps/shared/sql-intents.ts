import {
  type CompanyContext,
  canTransitionIntent,
  companyContextSchema,
  DomainError,
  type Intent,
  type IntentInput,
  type IntentState,
  type IntentStore,
  intentInputSchema,
  intentSchema,
  opaqueId,
} from "@fortnox-mcp/core";

export interface SqlPort {
  run(sql: string, bindings: readonly (string | number)[]): Promise<number>;
  first(
    sql: string,
    bindings: readonly (string | number)[],
  ): Promise<Record<string, unknown> | null>;
}

// Both runtimes execute the same bounded SQL operations. A transition is one CAS statement.
export class SqlIntentStore implements IntentStore {
  constructor(private readonly sql: SqlPort) {}

  async prepare(context: CompanyContext, input: IntentInput): Promise<Intent> {
    companyContextSchema.parse(context);
    intentInputSchema.parse(input);
    await this.sql.run(
      `INSERT INTO execution_intents (owner_id, company_id, id, input_hash, expires_at, state)
       VALUES (?, ?, ?, ?, ?, 'prepared') ON CONFLICT(owner_id, company_id, id) DO NOTHING`,
      [
        context.ownerId,
        context.companyId,
        input.id,
        input.inputHash,
        input.expiresAt,
      ],
    );
    const intent = await this.get(context, input.id);
    if (
      !intent ||
      intent.inputHash !== input.inputHash ||
      intent.expiresAt !== input.expiresAt
    ) {
      throw new DomainError("INTENT_CONFLICT");
    }
    return intent;
  }

  async get(context: CompanyContext, id: string): Promise<Intent | null> {
    companyContextSchema.parse(context);
    opaqueId.parse(id);
    const row = await this.sql.first(
      `SELECT owner_id AS ownerId, company_id AS companyId, id, input_hash AS inputHash,
       expires_at AS expiresAt, state FROM execution_intents WHERE owner_id = ? AND company_id = ? AND id = ?`,
      [context.ownerId, context.companyId, id],
    );
    return row ? intentSchema.parse(row) : null;
  }

  async transition(
    context: CompanyContext,
    id: string,
    from: IntentState,
    to: IntentState,
    now: number,
  ): Promise<boolean> {
    companyContextSchema.parse(context);
    opaqueId.parse(id);
    if (
      !Number.isSafeInteger(now) ||
      now < 0 ||
      !canTransitionIntent(from, to)
    ) {
      throw new DomainError("VALIDATION_FAILED");
    }
    const changed = await this.sql.run(
      `UPDATE execution_intents SET state = ? WHERE owner_id = ? AND company_id = ? AND id = ? AND state = ?
       AND (state != 'prepared' OR expires_at > ?)`,
      [to, context.ownerId, context.companyId, id, from, now],
    );
    return changed === 1;
  }
}
