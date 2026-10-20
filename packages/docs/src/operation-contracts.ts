import { z } from "zod";
import { sourceSchema } from "./contracts.js";

export const describeInput = z.strictObject({
  operation_id: z.string().min(1).max(1_000),
});
const short = z.string().max(300);
const schemaSummary = z.strictObject({
  reference: short.nullable(),
  doc_id: z.string().max(2_000).nullable(),
  preview: z.string().max(500),
  preview_complete: z.boolean(),
  required_fields: z.array(short).max(20).nullable(),
});
const media = z.strictObject({
  media_type: short,
  schema: schemaSummary.nullable(),
});
const parameter = z.strictObject({
  name: short,
  in: short,
  required: z.boolean(),
  description: z.string().max(500),
  schema: schemaSummary.nullable(),
});
const supplement = z.strictObject({
  basis: z.enum(["official_guide", "snapshot_review", "project_policy"]),
  reference_url: z.url(),
  reviewed_on: z.string(),
  text: z.string().max(2_000),
});
export const describeOutput = z.strictObject({
  operation_id: z.string().max(1_000),
  method: short,
  path: z.string().max(1_000),
  title: z.string().max(400),
  description: z.string().max(1_000),
  source: sourceSchema,
  parameters: z.array(parameter).max(20),
  request_body: z
    .strictObject({
      required: z.boolean(),
      description: z.string().max(500),
      content: z.array(media).max(4),
    })
    .nullable(),
  responses: z
    .array(
      z.strictObject({
        status: short,
        description: z.string().max(500),
        content: z.array(media).max(4),
      }),
    )
    .max(20),
  security: z.strictObject({
    declaration: z.enum(["absent", "declared", "explicitly_empty"]),
    location: z.enum(["operation", "root", "absent"]),
    declared_schemes: z
      .array(z.strictObject({ name: short, scopes: z.array(short).max(20) }))
      .max(20),
    authorization: z.literal("not_established"),
  }),
  reviewed: z.strictObject({
    status: z.enum(["matched", "unreviewed"]),
    revision: z.string().nullable(),
    scopes: z.strictObject({
      status: z.enum(["known", "unknown"]),
      values: z.array(short).max(20),
    }),
    side_effects: z.enum([
      "read",
      "provider_mutation",
      "external_delivery",
      "unknown",
    ]),
    notes: z.array(supplement).max(20),
  }),
  coverage: z.strictObject({
    status: z.literal("not_implemented"),
    execution_available: z.literal(false),
  }),
  complete: z.boolean(),
  details: z.strictObject({
    doc_id: z.string(),
    sections: z.array(z.string()),
  }),
  warnings: z.array(z.string()).max(10),
});
export type OperationDescription = z.infer<typeof describeOutput>;
