import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  type ReviewStore,
  reviewCommitSchema,
  reviewService,
} from "./review.js";
import { reviewWidget } from "./review-widget.js";

const resourceUri = "ui://s00/review-v1.html";
export interface ReviewContext {
  origin: string;
  store: ReviewStore;
  owner: string;
  authorized: boolean;
}
export function registerReview(server: McpServer, context: ReviewContext) {
  const origin = new URL(context.origin).origin;
  const service = reviewService(context.store, context.owner);
  const denied = () => ({
    isError: true,
    content: [{ type: "text" as const, text: "REVIEW_SCOPE_REQUIRED" }],
    _meta: {
      "mcp/www_authenticate": [
        `Bearer resource_metadata="${origin}/.well-known/oauth-protected-resource/mcp", error="insufficient_scope", error_description="Authorize the synthetic review scope", scope="mcp:read offline_access mcp:review"`,
      ],
    },
  });
  const securitySchemes = [
    { type: "oauth2", scopes: ["mcp:read", "mcp:review", "offline_access"] },
  ];
  server.registerResource(
    "s00-review",
    resourceUri,
    {
      mimeType: "text/html;profile=mcp-app",
      description: "Synthetic review experiment; no Fortnox operation.",
    },
    () => ({
      contents: [
        {
          uri: resourceUri,
          mimeType: "text/html;profile=mcp-app",
          text: reviewWidget,
          _meta: {
            ui: {
              csp: { connectDomains: [], resourceDomains: [] },
              prefersBorder: true,
            },
          },
        },
      ],
    }),
  );
  server.registerTool(
    "prepare_synthetic_review",
    {
      title: "Prepare synthetic review",
      description:
        "Show a fixed synthetic proposal in the embedded review view. No real financial operation. The human approves through the view; never fabricate a commit or approval capability.",
      inputSchema: z.object({}).strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
      _meta: { ui: { resourceUri }, securitySchemes },
    },
    async () => {
      if (!context.authorized) return denied();
      try {
        const result = await service.prepare();
        const { capability, ...publicResult } = result;
        const structuredContent = {
          kind: "s00-review-proposal",
          ...publicResult,
        };
        return {
          content: [{ type: "text", text: JSON.stringify(structuredContent) }],
          structuredContent,
          _meta: {
            s00Review: {
              proposalId: result.proposalId,
              proposalHash: result.proposalHash,
              expires: result.expires,
              capability,
            },
          },
        };
      } catch {
        return {
          isError: true,
          content: [{ type: "text", text: "REVIEW_UNAVAILABLE" }],
        };
      }
    },
  );
  server.registerTool(
    "commit_synthetic_review",
    {
      title: "Record synthetic review",
      description:
        "Embedded-view-only test approval. Accepts one immutable proposal reference and one-time UI capability; no replacement rows or real Fortnox operation.",
      inputSchema: reviewCommitSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
      _meta: { ui: { visibility: ["app"] }, securitySchemes },
    },
    async (input) => {
      if (!context.authorized) return denied();
      try {
        const result = await service.commit(input);
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
          structuredContent: result,
        };
      } catch {
        // A lost store response is not permission to retry the same intent.
        return {
          isError: true,
          content: [{ type: "text", text: "REVIEW_OUTCOME_UNKNOWN" }],
        };
      }
    },
  );
}
