import { z } from "zod";
import { DomainError } from "./errors.js";

export const opaqueId = z.string().regex(/^[a-zA-Z0-9_-]{1,128}$/);
export const companyContextSchema = z
  .object({
    ownerId: opaqueId,
    companyId: opaqueId,
  })
  .strict();
export type CompanyContext = z.infer<typeof companyContextSchema>;
export interface Identity {
  readonly ownerId: string;
  readonly companyIds: readonly string[];
}

export function authorizeCompany(
  identity: Identity,
  companyId: string,
): CompanyContext {
  if (!identity.companyIds.includes(companyId)) {
    throw new DomainError("COMPANY_FORBIDDEN");
  }
  return companyContextSchema.parse({ ownerId: identity.ownerId, companyId });
}
