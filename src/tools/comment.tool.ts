import { z } from "zod";
import { AxiosError } from "axios";
import { BaseTool } from "./BaseTool.js";
import { createApiClient, handleApiError, handleApiResponse } from "../utils/api.js";
import { CreateCommentArgs, Ctx, Tool } from "../types.js";

/**
 * A tool for managing comments on contacts.
 * This tool allows you to create comments for a given contact, which can be used for internal notes and collaboration.
 */
export class CommentTool extends BaseTool {
  /**
   * The list of tools provided by the CommentTool.
   * It includes the `create_comment` tool, which allows you to add a comment to a contact.
   */
  protected tools: Tool[] = [
    {
      name: "create_comment",
      description: "Add a comment to a contact for internal reference.",
      schema: {
        identifier: z
          .string()
          .describe("The contact's identifier. Can be the contact's ID, email, or phone number."),
        text: z
          .string()
          .max(1000)
          .describe(
            "The comment text. Max 1000 characters. To mention a user, use the format {{@user.ID}}."
          ),
      },
      handler: async (args, ctx) => {
        const { identifier, text } = args as CreateCommentArgs;
        try {
          const apiClient = createApiClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const response = await apiClient.post(`/contact/${identifier}/comment`, {
            text,
          });
          return handleApiResponse(response);
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },
    },
  ];
}
