import { z } from "zod";

// Synthetic, company-independent data only. This is not a Fortnox capability.
export const statusInput = z.strictObject({ dataset: z.literal("s01") });
export const statusOutput = z.strictObject({
  dataset: z.literal("s01"),
  synthetic: z.literal(true),
  status: z.literal("ok"),
});

export function readSyntheticStatus(): z.infer<typeof statusOutput> {
  return { dataset: "s01", synthetic: true, status: "ok" };
}
