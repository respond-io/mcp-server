import { z } from "zod";
import { BaseTool } from "./BaseTool.js";
import {
  createSdkClient,
  formatContactIdentifier,
  handleSdkError,
  handleSdkResponse,
} from "../utils/api.js";
import { Ctx, Tool } from "../types.js";

/**
 * A tool for managing conversations.
 * This tool provides functionalities for assigning conversations to users and updating their status.
 */
export class ConversationTool extends BaseTool {
  /**
   * The list of tools provided by the ConversationTool.
   * It includes tools for assigning a conversation and updating its status.
   */
  protected tools: Tool[] = [
    {
      name: "assign_conversation",
      description: "Assign or unassign a conversation to a user.",
      schema: {
        identifier: z
          .string()
          .describe("The contact's identifier. Can be the contact's ID, email, or phone number."),
        assignee: z
          .string()
          .nullable()
          .describe("The user ID or email of the assignee. Set to null to unassign."),
      },
      handler: async (args, ctx) => {
        const { identifier, assignee } = args as { identifier: string; assignee: string | null };
        try {
          const sdkClient = createSdkClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const formattedIdentifier = formatContactIdentifier(identifier);
          const result = await sdkClient.conversations.assign(formattedIdentifier, { assignee });
          return handleSdkResponse(result);
        } catch (error) {
          return handleSdkError(error);
        }
      },
    },
    {
      name: "update_conversation_status",
      description: "Open or close a conversation.",
      schema: {
        identifier: z
          .string()
          .describe("The contact's identifier. Can be the contact's ID, email, or phone number."),
        status: z
          .enum(["open", "close"])
          .describe("The desired conversation status, either 'open' or 'close'."),
        category: z
          .string()
          .optional()
          .describe("The closing note category, required when closing a conversation."),
        summary: z
          .string()
          .optional()
          .describe("A summary of the conversation, required when closing."),
      },
      handler: async (args, ctx) => {
        const { identifier, status, category, summary } = args as {
          identifier: string;
          status: string;
          category?: string;
          summary?: string;
        };
        try {
          const sdkClient = createSdkClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const formattedIdentifier = formatContactIdentifier(identifier);
          const result = await sdkClient.conversations.updateStatus(formattedIdentifier, {
            status: status as "open" | "close",
            category,
            summary,
          });
          return handleSdkResponse(result);
        } catch (error) {
          return handleSdkError(error);
        }
      },
    },
  ];
}
