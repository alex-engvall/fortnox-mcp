CREATE TABLE IF NOT EXISTS execution_intents (
  owner_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  id TEXT NOT NULL,
  input_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('prepared', 'submitting', 'succeeded', 'failed', 'outcome_unknown')),
  PRIMARY KEY (owner_id, company_id, id)
);
