import { z } from "zod";
import {
  type CompanyContext,
  companyContextSchema,
  opaqueId,
} from "./context.js";

export const intentInputSchema = z
  .object({
    id: opaqueId,
    inputHash: z.string().regex(/^[a-f0-9]{64}$/),
    expiresAt: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  })
  .strict();
export type IntentInput = z.infer<typeof intentInputSchema>;
export const intentStates = [
  "prepared",
  "submitting",
  "succeeded",
  "failed",
  "outcome_unknown",
] as const;
export type IntentState = (typeof intentStates)[number];
export interface Intent extends CompanyContext, IntentInput {
  readonly state: IntentState;
}
export interface IntentStore {
  prepare(context: CompanyContext, input: IntentInput): Promise<Intent>;
  get(context: CompanyContext, id: string): Promise<Intent | null>;
  transition(
    context: CompanyContext,
    id: string,
    from: IntentState,
    to: IntentState,
    now: number,
  ): Promise<boolean>;
}
export const intentSchema = companyContextSchema.extend({
  ...intentInputSchema.shape,
  state: z.enum(intentStates),
});
const allowedTransitions: Record<IntentState, readonly IntentState[]> = {
  prepared: ["submitting"],
  submitting: ["succeeded", "failed", "outcome_unknown"],
  outcome_unknown: ["succeeded", "failed"],
  succeeded: [],
  failed: [],
};

export function canTransitionIntent(
  from: IntentState,
  to: IntentState,
): boolean {
  return allowedTransitions[from]?.includes(to) ?? false;
}
