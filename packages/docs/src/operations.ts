import { DocsError } from "./contracts.js";
import {
  type JsonObject,
  type Operation,
  object,
  type ParsedOpenApi,
  resolveObject,
  resolvePointer,
  text,
} from "./openapi.js";
import {
  describeInput,
  type OperationDescription,
} from "./operation-contracts.js";
import { type ReviewPack, reviewedOperations } from "./reviews.js";

const MAX_DESCRIPTION_CHARACTERS = 24_000;
function entries(value: unknown): [string, unknown][] {
  return Object.entries(object(value ?? {}));
}
function array(value: unknown): unknown[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new DocsError("INVALID_SPEC");
  return value;
}
function referencedSchemaId(reference: string): string | null {
  if (!reference.startsWith("#/components/schemas/")) return null;
  const name = decodeURIComponent(
    reference.slice("#/components/schemas/".length),
  );
  if (name.includes("/")) return null;
  return `schema:${name.replace(/~1/g, "/").replace(/~0/g, "~")}`;
}

export function operationSections(api: ParsedOpenApi, operation: Operation) {
  const parameters = new Map<string, JsonObject>();
  // Operation-level parameters replace path-level parameters with the same name/location.
  for (const item of [
    ...array(operation.pathItem.parameters),
    ...array(operation.raw.parameters),
  ]) {
    const parameter = resolveObject(api.root, item);
    if (typeof parameter.name !== "string" || typeof parameter.in !== "string")
      throw new DocsError("INVALID_SPEC");
    parameters.set(JSON.stringify([parameter.in, parameter.name]), parameter);
  }
  const requestBody =
    operation.raw.requestBody === undefined
      ? null
      : resolveObject(api.root, operation.raw.requestBody);
  const responses = Object.fromEntries(
    entries(operation.raw.responses).map(([status, response]) => [
      status,
      resolveObject(api.root, response),
    ]),
  );
  const security = Object.hasOwn(operation.raw, "security")
    ? operation.raw.security
    : api.root.security;
  if (security !== undefined) {
    for (const requirement of array(security)) {
      for (const scopes of Object.values(object(requirement))) {
        if (!array(scopes).every((scope) => typeof scope === "string"))
          throw new DocsError("INVALID_SPEC");
      }
    }
  }
  return {
    parameters: [...parameters.values()],
    request_body: requestBody,
    responses,
    security: security ?? null,
  };
}

export function describeOperation(
  api: ParsedOpenApi | null,
  input: { operation_id: string },
  pack: ReviewPack = reviewedOperations,
): OperationDescription {
  const { operation_id } = describeInput.parse(input);
  if (!api) throw new DocsError("SPEC_UNAVAILABLE");
  const root = api.root;
  const operation = api.operations.get(operation_id);
  if (!operation) throw new DocsError("DOC_NOT_FOUND");
  const sections = operationSections(api, operation);
  let complete = true;
  function bounded(value: string, length: number): string {
    if (value.length > length) complete = false;
    return value.slice(0, length);
  }
  function first<T>(values: T[], length: number): T[] {
    if (values.length > length) complete = false;
    return values.slice(0, length);
  }
  function schema(value: unknown) {
    if (value === undefined) return null;
    const encoded = JSON.stringify(value);
    const node = typeof value === "boolean" ? {} : object(value);
    const reference = typeof node.$ref === "string" ? node.$ref : null;
    const targetValue =
      reference === null ? node : resolvePointer(root, reference);
    const target = typeof targetValue === "boolean" ? {} : object(targetValue);
    const required = ["allOf", "anyOf", "oneOf", "if", "$ref"].some((key) =>
      Object.hasOwn(target, key),
    )
      ? null
      : array(target.required).map((name) => {
          if (typeof name !== "string") throw new DocsError("INVALID_SPEC");
          return bounded(name, 300);
        });
    const docId = reference ? referencedSchemaId(reference) : null;
    return {
      reference: reference === null ? null : bounded(reference, 300),
      doc_id: docId,
      preview: bounded(encoded, 500),
      preview_complete: encoded.length <= 500,
      required_fields: required === null ? null : first(required, 20),
    };
  }
  function content(value: unknown) {
    return first(entries(value), 4).map(([mediaType, mediaValue]) => ({
      media_type: bounded(mediaType, 300),
      schema: schema(object(mediaValue).schema),
    }));
  }
  const rawSecurity = sections.security;
  const declaration =
    rawSecurity === null
      ? ("absent" as const)
      : array(rawSecurity).length === 0
        ? ("explicitly_empty" as const)
        : ("declared" as const);
  const schemes = first(
    array(rawSecurity ?? []).flatMap((item) =>
      entries(item).map(([name, scopes]) => ({
        name: bounded(name, 300),
        scopes: first(array(scopes), 20).map((scope) => {
          if (typeof scope !== "string") throw new DocsError("INVALID_SPEC");
          return bounded(scope, 300);
        }),
      })),
    ),
    20,
  );
  const review =
    api.source.sha256 === pack.sourceHash
      ? pack.operations.find(
          (item) =>
            item.operationId === operation.id &&
            item.method === operation.method &&
            item.path === operation.path,
        )
      : undefined;
  const notes = review
    ? [
        {
          basis: "official_guide" as const,
          reference_url: pack.scopeReference,
          reviewed_on: pack.reviewedOn,
          text: "Required scope names come from the reviewed resource/scope guide. A matching scope does not establish the current company's product license, user rights or consent.",
        },
        ...review.notes.map((note) => ({
          basis: note.basis,
          reference_url: note.reference,
          reviewed_on: pack.reviewedOn,
          text: note.text,
        })),
      ]
    : [];
  const result: OperationDescription = {
    operation_id: operation.id,
    method: operation.method,
    path: bounded(operation.path, 1_000),
    title: bounded(operation.title, 400),
    description: bounded(operation.description, 1_000),
    source: { ...api.source },
    parameters: first(sections.parameters, 20).map((parameter) => ({
      name: bounded(text(parameter.name), 300),
      in: bounded(text(parameter.in), 300),
      required: parameter.required === true,
      description: bounded(text(parameter.description), 500),
      schema: schema(parameter.schema),
    })),
    request_body:
      sections.request_body === null
        ? null
        : {
            required: sections.request_body.required === true,
            description: bounded(text(sections.request_body.description), 500),
            content: content(sections.request_body.content),
          },
    responses: first(Object.entries(sections.responses), 20).map(
      ([status, value]) => {
        const response = object(value);
        return {
          status: bounded(status, 300),
          description: bounded(text(response.description), 500),
          content: content(response.content),
        };
      },
    ),
    security: {
      declaration,
      location: Object.hasOwn(operation.raw, "security")
        ? "operation"
        : Object.hasOwn(api.root, "security")
          ? "root"
          : "absent",
      declared_schemes: schemes,
      authorization: "not_established",
    },
    reviewed: {
      status: review ? "matched" : "unreviewed",
      revision: review ? pack.revision : null,
      scopes: {
        status: review ? "known" : "unknown",
        values: review ? [...review.scopes] : [],
      },
      side_effects: review?.effect ?? "unknown",
      notes,
    },
    coverage: { status: "not_implemented", execution_available: false },
    complete,
    details: {
      doc_id: `operation:${operation.id}`,
      sections: [
        "overview",
        "parameters",
        "request_body",
        "responses",
        "security",
      ],
    },
    warnings: [
      "Security declarations and documentation do not establish anonymous access or company authorization.",
      "No company license, granted scope or provider permission has been checked.",
    ],
  };
  result.complete = complete;
  if (operation.raw.deprecated === true)
    result.warnings.push("The source marks this operation deprecated.");
  if (
    operation.raw["x-fn-is-hidden"] === true ||
    operation.raw["x-fn-is-public"] === false
  )
    result.warnings.push(
      "The source marks this operation hidden or non-public; documentation does not establish availability.",
    );
  if (!review)
    result.warnings.push(
      "No reviewed supplement matches this source hash and operation identity; scope and side effects remain unknown.",
    );
  while (JSON.stringify(result).length > MAX_DESCRIPTION_CHARACTERS - 500) {
    result.complete = false;
    if (result.responses.length) result.responses.pop();
    else if (result.parameters.length) result.parameters.pop();
    else if (result.security.declared_schemes.length)
      result.security.declared_schemes.pop();
    else throw new DocsError("INVALID_SPEC");
  }
  if (!result.complete)
    result.warnings.push(
      "This description is partial. Use read_api_doc with the returned details.doc_id and section, then follow continuation for the complete source details.",
    );
  return result;
}
