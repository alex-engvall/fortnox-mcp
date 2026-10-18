import type { Identity } from "./context.js";

export interface Clock {
  now(): number;
}
export interface SecretStore {
  get(name: string): Promise<string | undefined>;
}
export interface HttpClient {
  fetch(request: Request): Promise<Response>;
}
export interface TokenVerifier {
  verify(token: string): Promise<Identity | null>;
}
export type LogEvent = "request_failed" | "server_started";
export interface SafeLogger {
  // Intentionally accepts no payloads, headers, URLs or exception text.
  write(event: LogEvent): void;
}
