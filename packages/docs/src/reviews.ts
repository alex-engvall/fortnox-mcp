import sourceLock from "../../../docs/reference/source-lock.json" with {
  type: "json",
};

export interface OperationReview {
  operationId: string;
  method: string;
  path: string;
  scopes: readonly string[];
  effect: "read" | "provider_mutation" | "external_delivery";
  notes: readonly {
    basis: "official_guide" | "snapshot_review" | "project_policy";
    reference: string;
    text: string;
  }[];
}
export interface ReviewPack {
  sourceHash: string;
  revision: string;
  reviewedOn: string;
  scopeReference: string;
  operations: readonly OperationReview[];
}
const apiReference = "https://api.fortnox.se/apidocs";
const parametersReference =
  "https://www.fortnox.se/developer/guides-and-good-to-know/parameters";
export const reviewedOperations: ReviewPack = {
  sourceHash: sourceLock.sha256,
  revision: "2026-10-20.1",
  reviewedOn: "2026-10-20",
  scopeReference:
    "https://www.fortnox.se/developer/guides-and-good-to-know/scopes",
  operations: [
    {
      operationId: "CompanyInformationController_doIndex",
      method: "GET",
      path: "/3/companyinformation",
      scopes: ["companyinformation"],
      effect: "read",
      notes: [],
    },
    {
      operationId: "AccountController_doIndex",
      method: "GET",
      path: "/3/accounts",
      scopes: ["bookkeeping"],
      effect: "read",
      notes: [
        {
          basis: "official_guide",
          reference: parametersReference,
          text: "The global guide describes fiscal-year and pagination parameters that may be absent from operation schemas. Verify applicability per endpoint; this supplement does not silently add undocumented parameters.",
        },
      ],
    },
    {
      operationId: "VoucherController_doIndex",
      method: "GET",
      path: "/3/vouchers",
      scopes: ["bookkeeping"],
      effect: "read",
      notes: [],
    },
    {
      operationId: "VoucherController_doCreate",
      method: "POST",
      path: "/3/vouchers",
      scopes: ["bookkeeping"],
      effect: "provider_mutation",
      notes: [
        {
          basis: "snapshot_review",
          reference: apiReference,
          text: "The snapshot describes a provider-selected fiscal year when financialyear is omitted. Select and validate an explicit company/year in our implementation.",
        },
        {
          basis: "project_policy",
          reference:
            "https://github.com/alex-engvall/fortnox-mcp/blob/main/docs/contracts/approval.md",
          text: "Manual-voucher execution must follow the company's review policy and financial validation. Documentation cannot approve or execute a voucher.",
        },
      ],
    },
    {
      operationId: "InvoiceController_doShow",
      method: "GET",
      path: "/3/invoices/{DocumentNumber}",
      scopes: ["invoice"],
      effect: "read",
      notes: [],
    },
    {
      operationId: "InvoiceController_doUpdate",
      method: "PUT",
      path: "/3/invoices/{DocumentNumber}",
      scopes: ["invoice"],
      effect: "provider_mutation",
      notes: [
        {
          basis: "snapshot_review",
          reference: apiReference,
          text: "Without RowId, send every retained invoice row in the intended order. With RowId on any row, IDs select existing rows and rows without IDs create new rows; retain an unchanged row using a RowId-only object. Omitted rows are removed. RowIds are regenerated after each update. Review the resulting row set before enabling updates.",
        },
      ],
    },
    {
      operationId: "InvoiceController_doShowAndEmail",
      method: "GET",
      path: "/3/invoices/{DocumentNumber}/email",
      scopes: ["invoice"],
      effect: "external_delivery",
      notes: [
        {
          basis: "snapshot_review",
          reference: apiReference,
          text: "This GET sends an invoice to an external recipient. It is not a read-only action and must not be retried as an ordinary read.",
        },
      ],
    },
    {
      operationId: "InvoiceController_doShowAndEprint",
      method: "GET",
      path: "/3/invoices/{DocumentNumber}/eprint",
      scopes: ["invoice"],
      effect: "external_delivery",
      notes: [
        {
          basis: "snapshot_review",
          reference: apiReference,
          text: "This GET initiates external invoice delivery. Classify it by its effect, not its HTTP method.",
        },
      ],
    },
  ],
};
