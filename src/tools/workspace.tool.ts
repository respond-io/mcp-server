import { z } from "zod";
import { AxiosError, AxiosResponse } from "axios";
import { BaseTool } from "./BaseTool.js";
import { createApiClient, handleApiError, handleApiResponse } from "../utils/api.js";
import { CreateCustomFieldArgs, Ctx, PaginationArgs, Tool } from "../types.js";

/**
 * A tool for managing the workspace.
 * This tool provides functionalities for listing users, getting user details,
 * listing and creating custom fields, listing channels, and listing closing notes.
 */
export class WorkspaceTool extends BaseTool {
  /**
   * The list of tools provided by the WorkspaceTool.
   * It includes tools for managing users, custom fields, channels, and closing notes.
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
        const { limit, cursorId } = args as PaginationArgs;
        try {
          const params = new URLSearchParams();
          if (limit) {
            params.append("limit", String(limit));
          }
          if (cursorId) {
            params.append("cursorId", String(cursorId));
          }
          const apiClient = createApiClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const response: AxiosResponse = await apiClient.get(`/space/user?${params.toString()}`);
          return handleApiResponse(response);
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },
    },
    {
      name: "get_user",
      description: "Retrieve information about a specific user.",
      schema: {
        userId: z.string().describe("The ID of the user to retrieve."),
      },
      handler: async (args, ctx) => {
        const { userId } = args as { userId: string };
        try {
          const apiClient = createApiClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const response: AxiosResponse = await apiClient.get(`/space/user/${userId}`);
          return handleApiResponse(response);
        } catch (error) {
          return handleApiError(error as AxiosError);
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
        const { limit, cursorId } = args as PaginationArgs;
        try {
          const params = new URLSearchParams();
          if (limit) {
            params.append("limit", String(limit));
          }
          if (cursorId) {
            params.append("cursorId", String(cursorId));
          }
          const apiClient = createApiClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const response: AxiosResponse = await apiClient.get(
            `/space/custom_field?${params.toString()}`
          );
          return handleApiResponse(response);
        } catch (error) {
          return handleApiError(error as AxiosError);
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
        const { name, slug, description, dataType, allowedValues } = args as CreateCustomFieldArgs;
        try {
          const apiClient = createApiClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const response: AxiosResponse = await apiClient.post("/space/custom_field", {
            name,
            slug,
            description,
            dataType,
            allowedValues,
          });
          return handleApiResponse(response);
        } catch (error) {
          return handleApiError(error as AxiosError);
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
        const { limit, cursorId } = args as PaginationArgs;
        try {
          const params = new URLSearchParams();
          if (limit) {
            params.append("limit", String(limit));
          }
          if (cursorId) {
            params.append("cursorId", String(cursorId));
          }
          const apiClient = createApiClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const response: AxiosResponse = await apiClient.get(
            `/space/channel?${params.toString()}`
          );
          return handleApiResponse(response);
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },
    },
    {
      name: "list_closing_notes",
      description: "Get a list of all closing notes in the workspace.",
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
        const { limit, cursorId } = args as PaginationArgs;
        try {
          const params = new URLSearchParams();
          if (limit) {
            params.append("limit", String(limit));
          }
          if (cursorId) {
            params.append("cursorId", String(cursorId));
          }
          const apiClient = createApiClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const response: AxiosResponse = await apiClient.get(
            `/space/closing_notes?${params.toString()}`
          );
          return handleApiResponse(response);
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },
    },
  ];
}
