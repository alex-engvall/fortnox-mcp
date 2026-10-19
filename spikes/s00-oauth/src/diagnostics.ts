// Fixed labels only: no RPC bodies, tool arguments, IDs, URLs or credentials.
export interface McpRequestDiagnostic {
  method: "GET" | "POST" | "other";
  contentType: "json" | "absent" | "other";
  protocol: string;
  methods: string[];
  authorization: "absent" | "rejected" | "verified";
  transport: "rejected" | "modern" | "legacy";
  status: number;
}

export function diagnosticWindow(
  enabled: string | undefined,
  until: string | undefined,
  emit: (event: McpRequestDiagnostic) => void,
  now = Date.now,
) {
  const deadline =
    until && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(until)
      ? Date.parse(until)
      : NaN;
  if (
    enabled !== "true" ||
    !Number.isFinite(deadline) ||
    deadline <= now() ||
    deadline > now() + 15 * 60_000
  )
    return undefined;
  let remaining = 64;
  return (event: McpRequestDiagnostic) => {
    if (now() >= deadline || remaining <= 0) return;
    remaining--;
    emit(event);
  };
}
