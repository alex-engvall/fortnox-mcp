import {
  DocsCatalog,
  describeOutput,
  reviewedOperations,
} from "@fortnox-mcp/docs";
import { createDocsServer, createFoundationHandler } from "@fortnox-mcp/mcp";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { expect, it, vi } from "vitest";
import { docsFixture } from "./docs-fixture.js";

async function hash(raw: string) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw)),
    ),
    (byte) => byte.toString(16).padStart(2, "0"),
  ).join("");
}
async function reviewedCatalog(fixture: unknown) {
  const raw = JSON.stringify(fixture);
  // Explicit, in-process synthetic review dependency. No tool or environment setting can replace this pack.
  return DocsCatalog.create({
    raw,
    reviews: { ...reviewedOperations, sourceHash: await hash(raw) },
  });
}

export function operationDocsContract(): void {
  it("preserves schema aliases and OpenAPI 3.1 boolean/union schemas without inventing required fields", async () => {
    const fixture = docsFixture();
    fixture.openapi = "3.1.0";
    const schemas = fixture.components.schemas as unknown as Record<
      string,
      unknown
    >;
    schemas.Alias = { $ref: "#/components/schemas/OtherAlias" };
    schemas.OtherAlias = { $ref: "#/components/schemas/Alias" };
    schemas.Union = {
      oneOf: [
        { type: "object", required: ["a"] },
        { type: "object", required: ["b"] },
      ],
    };
    schemas.AcceptAll = true;
    const get = fixture.paths["/3/vouchers"].get as unknown as Record<
      string,
      unknown
    >;
    for (const name of ["Alias", "Union", "AcceptAll"]) {
      get.responses = {
        "200": {
          description: "Synthetic response",
          content: {
            "application/json": {
              schema: { $ref: `#/components/schemas/${name}` },
            },
          },
        },
      };
      const catalog = await DocsCatalog.create({
        raw: JSON.stringify(fixture),
      });
      const description = describeOutput.parse(
        catalog.describe({ operation_id: "VoucherController_doIndex" }),
      );
      expect(description.responses[0]?.content[0]?.schema?.doc_id).toBe(
        `schema:${name}`,
      );
      if (name !== "AcceptAll")
        expect(
          description.responses[0]?.content[0]?.schema?.required_fields,
        ).toBeNull();
      expect(
        catalog.read({ doc_id: `schema:${name}` }).content.length,
      ).toBeGreaterThan(0);
    }
  });
  it("resolves inherited parameters, local references, wildcard bodies and required schema fields", async () => {
    const fixture = docsFixture();
    const get = fixture.paths["/3/vouchers"].get as unknown as Record<
      string,
      unknown
    >;
    get.parameters = [
      { $ref: "#/components/parameters/Page" },
      {
        name: "financialyear",
        in: "query",
        required: true,
        schema: { type: "integer" },
      },
    ];
    const catalog = await DocsCatalog.create({ raw: JSON.stringify(fixture) });
    const read = describeOutput.parse(
      catalog.describe({ operation_id: "VoucherController_doIndex" }),
    );
    expect(read.parameters.map((parameter) => parameter.name)).toEqual([
      "financialyear",
      "page",
    ]);
    expect(read.parameters[0]?.required).toBe(true);
    expect(read.responses[0]?.content[0]?.schema?.doc_id).toBe(
      "schema:Voucher",
    );
    expect(read.responses[0]?.content[0]?.schema?.required_fields).toEqual([
      "description",
    ]);
    const create = describeOutput.parse(
      catalog.describe({ operation_id: "VoucherController_doCreate" }),
    );
    expect(create.request_body?.content[0]?.media_type).toBe("*/*");
    expect(create.request_body?.content[0]?.schema?.reference).toBe(
      "#/components/schemas/Voucher",
    );
    expect(catalog.read({ doc_id: "schema:Voucher" }).content).toContain(
      "#/components/schemas/Voucher",
    );
    expect(
      JSON.parse(
        catalog.read({
          doc_id: "operation:VoucherController_doIndex",
          section: "parameters",
        }).content,
      ),
    ).toHaveLength(2);
  });
  it("keeps absent, inherited and explicitly empty security distinct without establishing authorization", async () => {
    const fixture = docsFixture();
    const absent = await DocsCatalog.create({ raw: JSON.stringify(fixture) });
    expect(
      absent.describe({ operation_id: "VoucherController_doIndex" }).security,
    ).toMatchObject({
      declaration: "absent",
      location: "absent",
      authorization: "not_established",
    });
    const raw: Record<string, unknown> = {
      ...fixture,
      security: [{ ExampleOAuth: ["sample:read"] }],
    };
    const inherited = await DocsCatalog.create({ raw: JSON.stringify(raw) });
    const descriptor = inherited.describe({
      operation_id: "VoucherController_doIndex",
    });
    expect(descriptor.security).toMatchObject({
      declaration: "declared",
      location: "root",
      declared_schemes: [{ name: "ExampleOAuth", scopes: ["sample:read"] }],
    });
    expect(descriptor.reviewed.scopes).toEqual({
      status: "unknown",
      values: [],
    });
    expect(descriptor.reviewed.side_effects).toBe("unknown");
    (
      fixture.paths["/3/vouchers"].get as unknown as Record<string, unknown>
    ).security = [];
    const empty = await DocsCatalog.create({
      raw: JSON.stringify({ ...fixture, security: raw.security }),
    });
    expect(
      empty.describe({ operation_id: "VoucherController_doIndex" }).security,
    ).toMatchObject({
      declaration: "explicitly_empty",
      location: "operation",
      authorization: "not_established",
    });
  });
  it("binds scopes/effects to the reviewed source hash and operation identity, including GET email", async () => {
    const fixture = docsFixture();
    const reviewed = await reviewedCatalog(fixture);
    expect(
      reviewed.describe({ operation_id: "VoucherController_doIndex" }).reviewed,
    ).toMatchObject({
      status: "matched",
      scopes: { status: "known", values: ["bookkeeping"] },
      side_effects: "read",
    });
    const email = reviewed.describe({
      operation_id: "InvoiceController_doShowAndEmail",
    });
    email.source.sha256 = "changed by local consumer";
    expect(
      reviewed.describe({ operation_id: "InvoiceController_doShowAndEmail" })
        .source.sha256,
    ).not.toBe("changed by local consumer");
    expect(email.method).toBe("GET");
    expect(email.reviewed.side_effects).toBe("external_delivery");
    expect(email.coverage).toEqual({
      status: "not_implemented",
      execution_available: false,
    });
    const changed = docsFixture();
    changed.info.version = "2";
    const changedCatalog = await DocsCatalog.create({
      raw: JSON.stringify(changed),
      reviews: {
        ...reviewedOperations,
        sourceHash: await hash(JSON.stringify(fixture)),
      },
    });
    expect(
      changedCatalog.describe({
        operation_id: "InvoiceController_doShowAndEmail",
      }).reviewed,
    ).toMatchObject({
      status: "unreviewed",
      scopes: { status: "unknown", values: [] },
      side_effects: "unknown",
    });
    const wrongIdentity = await DocsCatalog.create({
      raw: JSON.stringify(fixture),
      reviews: {
        ...reviewedOperations,
        sourceHash: await hash(JSON.stringify(fixture)),
        operations: reviewedOperations.operations.map((operation) => ({
          ...operation,
          method: "DELETE",
        })),
      },
    });
    expect(
      wrongIdentity.describe({
        operation_id: "InvoiceController_doShowAndEmail",
      }).reviewed.status,
    ).toBe("unreviewed");
  });
  it("explains destructive row replacement and keeps policy separate from upstream facts", async () => {
    const catalog = await reviewedCatalog(docsFixture());
    const invoice = describeOutput.parse(
      catalog.describe({ operation_id: "InvoiceController_doUpdate" }),
    );
    const note = invoice.reviewed.notes.find(
      (item) => item.basis === "snapshot_review",
    );
    expect(note?.text).toContain("Omitted rows are removed");
    expect(note?.text).toContain("RowId-only");
    expect(note?.text).toContain("regenerated");
    expect(note?.text).toContain("intended order");
    const voucher = catalog.describe({
      operation_id: "VoucherController_doCreate",
    });
    expect(
      voucher.reviewed.notes.some(
        (item) =>
          item.basis === "project_policy" &&
          item.text.includes("cannot approve"),
      ),
    ).toBe(true);
    expect(invoice.source.reviewed_on).toBeNull();
    expect(note?.reviewed_on).toBe("2026-10-20");
    expect(invoice.reviewed.scopes.values).toEqual(["invoice"]);
  });
  it("bounds descriptions and offers complete paginated source sections", async () => {
    const fixture = docsFixture();
    const get = fixture.paths["/3/vouchers"].get as unknown as Record<
      string,
      unknown
    >;
    get.parameters = Array.from({ length: 30 }, (_, index) => ({
      name: `filter${index}`,
      in: "query",
      description: "parameter ".repeat(70),
      schema: { type: "string", description: "detail ".repeat(100) },
    }));
    get.responses = Object.fromEntries(
      Array.from({ length: 30 }, (_, index) => [
        String(200 + index),
        {
          description: "response ".repeat(100),
          content: Object.fromEntries(
            Array.from({ length: 4 }, (_, media) => [
              `application/example${media}`,
              { schema: { type: "string", description: "body ".repeat(150) } },
            ]),
          ),
        },
      ]),
    );
    const catalog = await DocsCatalog.create({ raw: JSON.stringify(fixture) });
    const result = describeOutput.parse(
      catalog.describe({ operation_id: "VoucherController_doIndex" }),
    );
    expect(result.complete).toBe(false);
    expect(JSON.stringify(result).length).toBeLessThanOrEqual(24_000);
    let page = catalog.read({
      doc_id: result.details.doc_id,
      section: "responses",
    });
    expect(page.continuation).not.toBeNull();
    expect(() =>
      catalog.read({
        doc_id: result.details.doc_id,
        section: "parameters",
        cursor: page.continuation ?? "",
      }),
    ).toThrow("INVALID_CURSOR");
    let full = page.content;
    while (page.continuation) {
      page = catalog.read({
        doc_id: result.details.doc_id,
        section: "responses",
        cursor: page.continuation,
      });
      full += page.content;
    }
    expect(Object.keys(JSON.parse(full))).toHaveLength(30);
  });
  it("rejects cyclic parameter aliases and excessive reference expansion without a fetch", async () => {
    const fixture = docsFixture();
    const component = fixture.components.parameters as unknown as Record<
      string,
      unknown
    >;
    component.Page = { $ref: "#/components/parameters/Page" };
    await expect(
      DocsCatalog.create({ raw: JSON.stringify(fixture) }),
    ).rejects.toThrow("INVALID_SPEC");
    const expanded = docsFixture();
    (
      expanded.components.parameters.Page as unknown as Record<string, unknown>
    ).description = "x".repeat(130_000);
    (
      expanded.paths["/3/vouchers"].get as unknown as Record<string, unknown>
    ).parameters = Array.from({ length: 30 }, (_, index) => ({
      $ref: "#/components/parameters/Page",
      name: `large${index}`,
    }));
    await expect(
      DocsCatalog.create({ raw: JSON.stringify(expanded) }),
    ).rejects.toThrow("INVALID_SPEC");
  });
  it("provides operation descriptions through MCP without exposing execution or source replacement", async () => {
    const catalog = await reviewedCatalog(docsFixture());
    const network = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new Error("Network forbidden"));
    const handler = createFoundationHandler(() => createDocsServer(catalog));
    const client = new Client({
      name: "operation-docs-contract",
      version: "1",
    });
    try {
      await client.connect(
        new StreamableHTTPClientTransport(new URL("http://localhost/mcp"), {
          fetch: (input, init) => handler(new Request(input, init)),
        }),
      );
      const response = await client.callTool({
        name: "describe_api_operation",
        arguments: { operation_id: "InvoiceController_doShowAndEmail" },
      });
      expect(response.isError).not.toBe(true);
      expect(
        describeOutput.parse(response.structuredContent).reviewed.side_effects,
      ).toBe("external_delivery");
      for (const argumentsValue of [
        { operation_id: "missing" },
        { operation_id: "InvoiceController_doShowAndEmail", execute: true },
        {
          operation_id: "InvoiceController_doShowAndEmail",
          sourceHash: "forged",
          url: "https://example.invalid",
        },
      ]) {
        expect(
          (
            await client.callTool({
              name: "describe_api_operation",
              arguments: argumentsValue,
            })
          ).isError,
        ).toBe(true);
      }
      expect(network).not.toHaveBeenCalled();
      expect(() => catalog.describe({ operation_id: "unknown" })).toThrow(
        "DOC_NOT_FOUND",
      );
      const guides = await DocsCatalog.create();
      expect(() => guides.describe({ operation_id: "anything" })).toThrow(
        "SPEC_UNAVAILABLE",
      );
    } finally {
      await client.close();
      network.mockRestore();
    }
  });
}
