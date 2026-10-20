import { DocsError, type DocsSource, MAX_SPEC_BYTES } from "./contracts.js";

export type JsonObject = Record<string, unknown>;
export const methods = [
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "head",
  "options",
  "trace",
] as const;
export const officialReference = "https://api.fortnox.se/apidocs";

export function object(value: unknown): JsonObject {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new DocsError("INVALID_SPEC");
  return value as JsonObject;
}
export function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}
// Bound escaping and indentation before serialization allocates an expanded
// reference section. The imported source stays reference data throughout.
export function serializeSection(value: unknown): string {
  let budget = 2 * 1024 * 1024;
  return JSON.stringify(
    value,
    (key, item: unknown) => {
      budget -=
        210 + key.length * 6 + (typeof item === "string" ? item.length * 6 : 0);
      if (budget < 0) throw new DocsError("INVALID_SPEC");
      return item;
    },
    2,
  );
}
export async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export function resolvePointer(root: JsonObject, reference: string): unknown {
  if (!reference.startsWith("#/")) throw new DocsError("INVALID_SPEC");
  let value: unknown = root;
  let tokens: string[];
  try {
    tokens = decodeURIComponent(reference.slice(2)).split("/");
  } catch {
    throw new DocsError("INVALID_SPEC");
  }
  for (const token of tokens) {
    const key = token.replace(/~1/g, "/").replace(/~0/g, "~");
    if (
      value === null ||
      typeof value !== "object" ||
      !Object.hasOwn(value, key)
    )
      throw new DocsError("INVALID_SPEC");
    value = (value as JsonObject)[key];
  }
  return value;
}

// Follow reference objects only. Schema recursion stays as readable references.
export function resolveObject(root: JsonObject, value: unknown): JsonObject {
  let result = object(value);
  const seen = new Set<string>();
  while (typeof result.$ref === "string") {
    if (seen.has(result.$ref) || seen.size >= 100)
      throw new DocsError("INVALID_SPEC");
    seen.add(result.$ref);
    result = {
      ...resolveObjectTarget(root, result.$ref),
      ...Object.fromEntries(
        Object.entries(result).filter(([key]) => key !== "$ref"),
      ),
    };
  }
  return result;
}
function resolveObjectTarget(root: JsonObject, reference: string): JsonObject {
  return object(resolvePointer(root, reference));
}

export interface Operation {
  id: string;
  method: string;
  path: string;
  resource: string;
  title: string;
  description: string;
  raw: JsonObject;
  pathItem: JsonObject;
}
export interface ParsedOpenApi {
  root: JsonObject;
  source: DocsSource;
  operations: Map<string, Operation>;
  schemas: JsonObject;
}

export async function parseOpenApi(
  raw: string,
  importedAt: string,
): Promise<ParsedOpenApi> {
  if (new TextEncoder().encode(raw).length > MAX_SPEC_BYTES)
    throw new DocsError("INVALID_SPEC");
  let root: JsonObject;
  try {
    root = object(JSON.parse(raw));
  } catch {
    throw new DocsError("INVALID_SPEC");
  }
  if (!/^3\.(0|1)\./.test(text(root.openapi)))
    throw new DocsError("INVALID_SPEC");
  const info = object(root.info);
  if (typeof info.title !== "string" || typeof info.version !== "string")
    throw new DocsError("INVALID_SPEC");
  const paths = object(root.paths);
  const components = object(root.components ?? {});
  const schemas = object(components.schemas ?? {});
  let nodes = 0;
  function inspect(value: unknown, depth: number): void {
    if (++nodes > 500_000 || depth > 100) throw new DocsError("INVALID_SPEC");
    if (typeof value === "number" && !Number.isFinite(value))
      throw new DocsError("INVALID_SPEC");
    if (Array.isArray(value)) {
      for (const item of value) inspect(item, depth + 1);
    } else if (value !== null && typeof value === "object") {
      const record = value as JsonObject;
      if (Object.hasOwn(record, "$ref")) {
        if (typeof record.$ref !== "string")
          throw new DocsError("INVALID_SPEC");
        resolvePointer(root, record.$ref);
      }
      for (const item of Object.values(record)) inspect(item, depth + 1);
    }
  }
  inspect(root, 0);
  const operations = new Map<string, Operation>();
  for (const [path, value] of Object.entries(paths)) {
    if (!path.startsWith("/")) throw new DocsError("INVALID_SPEC");
    const pathItem = resolveObject(root, value);
    for (const method of methods) {
      if (!Object.hasOwn(pathItem, method)) continue;
      const operation = object(pathItem[method]);
      if (Object.keys(object(operation.responses)).length === 0)
        throw new DocsError("INVALID_SPEC");
      const id =
        text(operation.operationId) || `${method.toUpperCase()} ${path}`;
      if (operations.has(id) || id.length > 1_000)
        throw new DocsError("INVALID_SPEC");
      const tags = Array.isArray(operation.tags)
        ? operation.tags.filter((tag): tag is string => typeof tag === "string")
        : [];
      operations.set(id, {
        id,
        method: method.toUpperCase(),
        path,
        resource: tags.join(" "),
        title: text(operation.summary) || id,
        description: text(operation.description),
        raw: operation,
        pathItem,
      });
    }
  }
  return {
    root,
    schemas,
    operations,
    source: {
      kind: "user_supplied_openapi",
      reference_url: officialReference,
      acquisition_url: null,
      reviewed_on: null,
      imported_at: importedAt,
      sha256: await sha256(raw),
    },
  };
}
