import { z } from "zod";
import { AxiosError, AxiosResponse } from "axios";
import { BaseTool } from "./BaseTool.js";
import { createApiClient, handleApiError, handleApiResponse } from "../utils/api.js";
import {
  CreateContactArgs,
  Ctx,
  GetContactArgs,
  ListContactsArgs,
  TagOperationArgs,
  Tool,
  UpdateContactArgs,
} from "../types.js";

/**
 * A tool for managing contacts.
 * This tool provides a comprehensive set of functionalities for contact management,
 * including creating, retrieving, updating, deleting, and listing contacts,
 * as well as managing contact tags.
 */
export class ContactsTool extends BaseTool {
  /**
   * The list of tools provided by the ContactsTool.
   * It includes tools for getting, creating, updating, deleting, and listing contacts,
   * as well as adding and removing tags from a contact.
   */
  protected tools: Tool[] = [
    {
      name: "get_contact",
      description:
        "Retrieve information about a specific contact by their ID, email, or phone number.",
      schema: {
        identifier: z
          .string()
          .describe(
            "The contact's identifier. Can be the contact's ID, email, or phone number, formatted as 'id:123', 'email:user@example.com', or 'phone:+1234567890'."
          ),
      },
      handler: async (args, ctx) => {
        const { identifier } = args as GetContactArgs;
        try {
          const apiClient = createApiClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const response: AxiosResponse = await apiClient.get(`/contact/${identifier}`);
          return handleApiResponse(response);
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },
    },
    {
      name: "create_contact",
      description: "Create a new contact in the workspace.",
      schema: {
        identifier: z
          .string()
          .describe(
            "The contact's identifier, using their phone or email, formatted as 'email:user@example.com' or 'phone:+1234567890'."
          ),
        firstName: z.string().describe("The first name of the contact."),
        lastName: z.string().optional().describe("The last name of the contact."),
        email: z.string().optional().describe("The contact's email address."),
        phone: z
          .string()
          .optional()
          .describe("The contact's phone number, including the country code (e.g., +60123456789)."),
        language: z
          .string()
          .optional()
          .describe(
            "The contact's language code, based on the ISO 639-1 standard (e.g., 'en' for English, 'ms' for Malay)."
          ),
        custom_fields: z
          .array(
            z.object({
              name: z.string(),
              value: z.any(),
            })
          )
          .optional()
          .describe("An array of custom field objects, each with a name and value."),
      },
      handler: async (args, ctx) => {
        const { identifier, ...data } = args as CreateContactArgs;
        try {
          const apiClient = createApiClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const response: AxiosResponse = await apiClient.post(`/contact/${identifier}`, data);
          return handleApiResponse(response);
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },
    },
    {
      name: "update_contact",
      description: "Update an existing contact's information.",
      schema: {
        identifier: z
          .string()
          .describe("The contact's identifier. Can be the contact's ID, email, or phone number."),
        firstName: z.string().optional().describe("The contact's new first name."),
        lastName: z.string().optional().describe("The contact's new last name."),
        email: z.string().optional().describe("The contact's new email address."),
        phone: z.string().optional().describe("The contact's new phone number."),
        language: z.string().optional().describe("The contact's new language code."),
        custom_fields: z.array(z.any()).optional().describe("An array of custom fields to update."),
      },
      handler: async (args, ctx) => {
        const { identifier, ...data } = args as UpdateContactArgs;
        try {
          const apiClient = createApiClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const response: AxiosResponse = await apiClient.put(`/contact/${identifier}`, data);
          return handleApiResponse(response);
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },
    },
    {
      name: "delete_contact",
      description: "Delete a contact from the workspace.",
      schema: {
        identifier: z
          .string()
          .describe("The contact's identifier. Can be the contact's ID, email, or phone number."),
      },
      handler: async (args, ctx) => {
        const { identifier } = args as GetContactArgs;
        try {
          const apiClient = createApiClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const response: AxiosResponse = await apiClient.delete(`/contact/${identifier}`);
          return handleApiResponse(response);
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },
    },
    {
      name: "list_contacts",
      description: "List contacts with optional filters and search.",
      schema: {
        limit: z
          .number()
          .min(1)
          .max(100)
          .default(10)
          .describe("The number of contacts to return, between 1 and 100."),
        cursorId: z.number().optional().describe("The cursor ID for pagination."),
        search: z.string().optional().describe("A search query to filter contacts."),
        timezone: z
          .string()
          .default("UTC")
          .describe("The timezone to use for the search (e.g., 'Asia/Kuala_Lumpur')."),
      },
      handler: async (args, ctx) => {
        const { limit = 10, cursorId, search = "", timezone = "UTC" } = args as ListContactsArgs;
        try {
          const params = new URLSearchParams();
          params.append("limit", String(limit));
          if (cursorId) {
            params.append("cursorId", String(cursorId));
          }
          const apiClient = createApiClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const response: AxiosResponse = await apiClient.post(
            `/contact/list?${params.toString()}`,
            {
              search,
              filter: { $and: [] },
              timezone,
            }
          );
          return handleApiResponse(response);
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },
    },
    {
      name: "add_contact_tags",
      description: "Add tags to a contact.",
      schema: {
        identifier: z
          .string()
          .describe("The contact's identifier. Can be the contact's ID, email, or phone number."),
        tags: z
          .array(z.string())
          .nonempty()
          .describe("An array of tag names to add to the contact."),
      },
      handler: async (args, ctx) => {
        const { identifier, tags } = args as TagOperationArgs;
        try {
          const apiClient = createApiClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const response: AxiosResponse = await apiClient.post(`/contact/${identifier}/tag`, {
            tags,
          });
          return handleApiResponse(response);
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },
    },
    {
      name: "remove_contact_tags",
      description: "Remove tags from a contact.",
      schema: {
        identifier: z
          .string()
          .describe("The contact's identifier. Can be the contact's ID, email, or phone number."),
        tags: z
          .array(z.string())
          .nonempty()
          .describe("An array of tag names to remove from the contact."),
      },
      handler: async (args, ctx) => {
        const { identifier, tags } = args as TagOperationArgs;
        try {
          const apiClient = createApiClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const response: AxiosResponse = await apiClient.delete(`/contact/${identifier}/tag`, {
            data: { tags },
          });
          return handleApiResponse(response);
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },
    },
  ];
}
