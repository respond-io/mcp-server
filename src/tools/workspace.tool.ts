import { z } from "zod";
import { BaseTool } from "./BaseTool.js";
import { createSdkClient, handleSdkError, handleSdkResponse } from "../utils/api.js";
import { CustomFieldDataType } from "@respond-io/typescript-sdk";
import { Ctx, Tool } from "../types.js";

/**
 * A tool for managing the workspace.
 * This tool provides functionalities for listing users, creating custom fields,
 * listing channels, and managing tags.
 */
export class WorkspaceTool extends BaseTool {
  /**
   * The list of tools provided by the WorkspaceTool.
   * It includes tools for managing users, custom fields, channels, and tags.
   */
  protected tools: Tool[] = [
    {
      name: "list_users",
      description: "Get a list of users in the workspace.",
      schema: {
        limit: z
          .number()
          .min(1)
          .max(100)
          .default(10)
          .describe("The number of users to return, between 1 and 100."),
        cursorId: z.number().optional().describe("The cursor ID for pagination."),
      },
      handler: async (args, ctx) => {
        const { limit, cursorId } = args as { limit?: number; cursorId?: number };
        try {
          const sdkClient = createSdkClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const result = await sdkClient.space.listUsers({ limit, cursorId });
          return handleSdkResponse(result);
        } catch (error) {
          return handleSdkError(error);
        }
      },
    },
    {
      name: "get_user",
      description: "Get a workspace user by their ID.",
      schema: {
        id: z.number().describe("The user ID."),
      },
      handler: async (args, ctx) => {
        const { id } = args as { id: number };
        try {
          const sdkClient = createSdkClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const result = await sdkClient.space.getUser(id);
          return handleSdkResponse(result);
        } catch (error) {
          return handleSdkError(error);
        }
      },
    },
    {
      name: "list_custom_fields",
      description: "Get a list of all custom fields in the workspace.",
      schema: {
        limit: z
          .number()
          .min(1)
          .max(100)
          .default(10)
          .describe("The number of custom fields to return, between 1 and 100."),
        cursorId: z.number().optional().describe("The cursor ID for pagination."),
      },
      handler: async (args, ctx) => {
        const { limit, cursorId } = args as { limit?: number; cursorId?: number };
        try {
          const sdkClient = createSdkClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const result = await sdkClient.space.listCustomFields({ limit, cursorId });
          return handleSdkResponse(result);
        } catch (error) {
          return handleSdkError(error);
        }
      },
    },
    {
      name: "get_custom_field",
      description: "Get a custom field by its ID.",
      schema: {
        id: z.number().describe("The custom field ID."),
      },
      handler: async (args, ctx) => {
        const { id } = args as { id: number };
        try {
          const sdkClient = createSdkClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const result = await sdkClient.space.getCustomField(id);
          return handleSdkResponse(result);
        } catch (error) {
          return handleSdkError(error);
        }
      },
    },
    {
      name: "create_custom_field",
      description: "Create a new custom field.",
      schema: {
        name: z.string().max(50).describe("The name of the custom field (max 50 characters)."),
        slug: z
          .string()
          .regex(/^[A-Za-z0-9_]+$/)
          .optional()
          .describe(
            "A unique identifier for the custom field (letters, numbers, and underscores only)."
          ),
        description: z.string().optional().describe("A description for the custom field."),
        dataType: z
          .enum(["text", "list", "checkbox", "email", "number", "url", "date", "time"])
          .describe("The data type of the custom field."),
        allowedValues: z
          .array(z.string())
          .optional()
          .describe("An array of allowed values, required for 'list' data types."),
      },
      handler: async (args, ctx) => {
        const { name, slug, description, dataType, allowedValues } = args as {
          name: string;
          slug?: string;
          description?: string;
          dataType: CustomFieldDataType;
          allowedValues?: string[];
        };
        try {
          const sdkClient = createSdkClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const result = await sdkClient.space.createCustomField({
            name,
            slug,
            description,
            dataType,
            allowedValues,
          });
          return handleSdkResponse(result);
        } catch (error) {
          return handleSdkError(error);
        }
      },
    },
    {
      name: "list_channels",
      description: "Get all messaging channels connected in the workspace.",
      schema: {
        limit: z
          .number()
          .min(1)
          .max(100)
          .default(10)
          .describe("The number of channels to return, between 1 and 100."),
        cursorId: z.number().optional().describe("The cursor ID for pagination."),
      },
      handler: async (args, ctx) => {
        const { limit, cursorId } = args as { limit?: number; cursorId?: number };
        try {
          const sdkClient = createSdkClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const result = await sdkClient.space.listChannels({ limit, cursorId });
          return handleSdkResponse(result);
        } catch (error) {
          return handleSdkError(error);
        }
      },
    },
    {
      name: "list_closing_notes",
      description: "List closing note categories/options used when closing conversations.",
      schema: {
        limit: z
          .number()
          .min(1)
          .max(100)
          .default(10)
          .describe("The number of closing notes to return, between 1 and 100."),
        cursorId: z.number().optional().describe("The cursor ID for pagination."),
      },
      handler: async (args, ctx) => {
        const { limit, cursorId } = args as { limit?: number; cursorId?: number };
        try {
          const sdkClient = createSdkClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const result = await sdkClient.space.listClosingNotes({ limit, cursorId });
          return handleSdkResponse(result);
        } catch (error) {
          return handleSdkError(error);
        }
      },
    },
    {
      name: "list_templates",
      description: "List WhatsApp (or channel) message templates for a channel.",
      schema: {
        channelId: z.number().describe("The channel ID to list templates for."),
        limit: z
          .number()
          .min(1)
          .max(100)
          .default(10)
          .describe("The number of templates to return, between 1 and 100."),
        cursorId: z.number().optional().describe("The cursor ID for pagination."),
      },
      handler: async (args, ctx) => {
        const {
          channelId,
          limit = 10,
          cursorId,
        } = args as {
          channelId: number;
          limit?: number;
          cursorId?: number;
        };
        try {
          const sdkClient = createSdkClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const result = await sdkClient.space.listTemplates(channelId, { limit, cursorId });
          return handleSdkResponse(result);
        } catch (error) {
          return handleSdkError(error);
        }
      },
    },
    {
      name: "create_tag",
      description: "Create a workspace tag (used to tag contacts or conversations).",
      schema: {
        name: z.string().describe("The tag name."),
        description: z.string().optional().describe("Optional description for the tag."),
        colorCode: z
          .string()
          .optional()
          .describe("Optional hex color code for the tag (e.g. #FF5733)."),
        emoji: z.string().optional().describe("Optional emoji for the tag."),
      },
      handler: async (args, ctx) => {
        const { name, description, colorCode, emoji } = args as {
          name: string;
          description?: string;
          colorCode?: string;
          emoji?: string;
        };
        try {
          const sdkClient = createSdkClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const result = await sdkClient.space.createTag({
            name,
            description,
            colorCode,
            emoji,
          });
          return handleSdkResponse(result);
        } catch (error) {
          return handleSdkError(error);
        }
      },
    },
    {
      name: "update_tag",
      description: "Update an existing workspace tag.",
      schema: {
        currentName: z.string().describe("The current name of the tag to update."),
        name: z.string().optional().describe("The new name for the tag."),
        colorCode: z.string().optional().describe("Optional new hex color code (e.g. #FFD700)."),
      },
      handler: async (args, ctx) => {
        const { currentName, name, colorCode } = args as {
          currentName: string;
          name?: string;
          colorCode?: string;
        };
        try {
          const sdkClient = createSdkClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const result = await sdkClient.space.updateTag({
            currentName,
            name,
            colorCode,
          });
          return handleSdkResponse(result);
        } catch (error) {
          return handleSdkError(error);
        }
      },
    },
    {
      name: "delete_tag",
      description: "Delete a workspace tag by name.",
      schema: {
        name: z.string().describe("The name of the tag to delete."),
      },
      handler: async (args, ctx) => {
        const { name } = args as { name: string };
        try {
          const sdkClient = createSdkClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const result = await sdkClient.space.deleteTag({ name });
          return handleSdkResponse(result);
        } catch (error) {
          return handleSdkError(error);
        }
      },
    },
  ];
}
