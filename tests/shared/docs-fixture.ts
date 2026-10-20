// Independently authored synthetic OpenAPI. No provider specification is copied.
export function docsFixture() {
  return {
    openapi: "3.0.3",
    info: { title: "Synthetic reference", version: "1" },
    paths: {
      "/3/vouchers": {
        parameters: [
          { name: "financialyear", in: "query", schema: { type: "integer" } },
        ],
        get: {
          operationId: "VoucherController_doIndex",
          summary: "List vouchers",
          tags: ["Vouchers"],
          description: "Read synthetic vouchers for the selected fiscal year.",
          parameters: [{ $ref: "#/components/parameters/Page" }],
          responses: {
            "200": {
              description: "Synthetic list",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Voucher" },
                },
              },
            },
          },
        },
        post: {
          operationId: "VoucherController_doCreate",
          summary: "Create voucher",
          tags: ["Vouchers"],
          requestBody: {
            content: {
              "*/*": { schema: { $ref: "#/components/schemas/Voucher" } },
            },
          },
          responses: { "201": { description: "Created" } },
        },
      },
      "/3/invoices/{DocumentNumber}": {
        parameters: [
          {
            name: "DocumentNumber",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        put: {
          operationId: "InvoiceController_doUpdate",
          summary: "Update invoice rows",
          responses: { "200": { description: "Updated" } },
        },
      },
      "/3/invoices/{DocumentNumber}/email": {
        get: {
          operationId: "InvoiceController_doShowAndEmail",
          summary: "Send invoice as email",
          responses: { "200": { description: "Sent" } },
        },
      },
    },
    components: {
      parameters: {
        Page: {
          name: "page",
          in: "query",
          schema: { type: "integer", minimum: 1 },
        },
      },
      schemas: {
        Voucher: {
          type: "object",
          required: ["description"],
          properties: {
            description: { type: "string" },
            next: { $ref: "#/components/schemas/Voucher" },
          },
        },
        Large: { type: "string", description: "reference-text ".repeat(1_700) },
        "A/B~C": { type: "object" },
        Escaped: { $ref: "#/components/schemas/A~1B~0C" },
      },
    },
  };
}
