export type ErrorCode =
  | "AUTH_REQUIRED"
  | "COMPANY_FORBIDDEN"
  | "VALIDATION_FAILED"
  | "INTENT_CONFLICT"
  | "CAPABILITY_UNAVAILABLE";

export class DomainError extends Error {
  constructor(public readonly code: ErrorCode) {
    super(code);
    this.name = "DomainError";
  }
}
