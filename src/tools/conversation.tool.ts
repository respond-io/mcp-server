import { z } from "zod";
import { AxiosError, AxiosResponse } from "axios";
import { BaseTool } from "./BaseTool.js";
import { createApiClient, handleApiError, handleApiResponse } from "../utils/api.js";
import { AssignConversationArgs, Tool, ToolArgs, UpdateConversationStatusArgs } from "../types.js";

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
      handler: async (args: ToolArgs, ctx: any) => {
        const { identifier, assignee } = args as AssignConversationArgs;
        try {
          const apiClient = createApiClient(this.apiBaseUrl, this.mode, ctx);
          const response: AxiosResponse = await apiClient.post(
            `/contact/${identifier}/conversation/assignee`,
            {
              assignee,
            }
          );
          return handleApiResponse(response);
        } catch (error) {
          return handleApiError(error as AxiosError);
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
      handler: async (args: ToolArgs, ctx: any) => {
        const { identifier, status, category, summary } = args as UpdateConversationStatusArgs;
        try {
          const apiClient = createApiClient(this.apiBaseUrl, this.mode, ctx);
          const response: AxiosResponse = await apiClient.post(
            `/contact/${identifier}/conversation/status`,
            {
              status,
              category,
              summary,
            }
          );
          return handleApiResponse(response);
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },
    },
  ];
}
