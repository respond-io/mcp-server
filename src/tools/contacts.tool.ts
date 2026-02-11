import { z } from "zod";
import { BaseTool } from "./BaseTool.js";
import {
  createSdkClient,
  formatContactIdentifier,
  handleSdkError,
  handleSdkResponse,
} from "../utils/api.js";
import { ContactFields, CustomFieldValue } from "@respond-io/typescript-sdk";
import { Ctx, Tool } from "../types.js";

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
        const { identifier } = args as { identifier: string };
        try {
          const sdkClient = createSdkClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const formattedIdentifier = formatContactIdentifier(identifier);
          const contact = await sdkClient.contacts.get(formattedIdentifier);
          return handleSdkResponse(contact);
        } catch (error) {
          return handleSdkError(error);
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
        const { identifier, firstName, lastName, phone, email, language, custom_fields } = args as {
          identifier: string;
          firstName: string;
          lastName?: string | null;
          phone?: string | null;
          email?: string | null;
          language?: string | null;
          custom_fields?: CustomFieldValue[];
        };
        const data: ContactFields = { firstName, lastName, phone, email, language, custom_fields };
        try {
          const sdkClient = createSdkClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          // For creation, we need email: or phone: format, not id:
          let formattedIdentifier: `email:${string}` | `phone:${string}`;
          if (identifier.includes("@")) {
            formattedIdentifier = `email:${identifier}`;
          } else if (identifier.startsWith("+") || /^\d+$/.test(identifier)) {
            formattedIdentifier = `phone:${identifier.startsWith("+") ? identifier : "+" + identifier}`;
          } else {
            formattedIdentifier = `email:${identifier}`; // Default to email
          }
          const contact = await sdkClient.contacts.create(formattedIdentifier, data);
          return handleSdkResponse(contact);
        } catch (error) {
          return handleSdkError(error);
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
        const { identifier, ...data } = args as { identifier: string } & Partial<ContactFields>;
        try {
          const sdkClient = createSdkClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const formattedIdentifier = formatContactIdentifier(identifier);
          const contact = await sdkClient.contacts.update(formattedIdentifier, data);
          return handleSdkResponse(contact);
        } catch (error) {
          return handleSdkError(error);
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
        const { identifier } = args as { identifier: string };
        try {
          const sdkClient = createSdkClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const formattedIdentifier = formatContactIdentifier(identifier);
          await sdkClient.contacts.delete(formattedIdentifier);
          return handleSdkResponse({ success: true, message: "Contact deleted successfully" });
        } catch (error) {
          return handleSdkError(error);
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
        const {
          limit = 10,
          cursorId,
          search = "",
          timezone = "UTC",
        } = args as {
          limit?: number;
          cursorId?: number;
          search?: string;
          timezone?: string;
        };
        try {
          const sdkClient = createSdkClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const result = await sdkClient.contacts.list(
            {
              search,
              timezone,
              filter: { $and: [] },
            },
            {
              limit,
              cursorId,
            }
          );
          return handleSdkResponse(result);
        } catch (error) {
          return handleSdkError(error);
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
        const { identifier, tags } = args as { identifier: string; tags: string[] };
        try {
          const sdkClient = createSdkClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const formattedIdentifier = formatContactIdentifier(identifier);
          await sdkClient.contacts.addTags(formattedIdentifier, tags);
          return handleSdkResponse({ success: true, message: "Tags added successfully" });
        } catch (error) {
          return handleSdkError(error);
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
        const { identifier, tags } = args as { identifier: string; tags: string[] };
        try {
          const sdkClient = createSdkClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const formattedIdentifier = formatContactIdentifier(identifier);
          await sdkClient.contacts.deleteTags(formattedIdentifier, tags);
          return handleSdkResponse({ success: true, message: "Tags removed successfully" });
        } catch (error) {
          return handleSdkError(error);
        }
      },
    },
    {
      name: "create_or_update_contact",
      description:
        "Create a contact if they do not exist, or update the existing contact. Uses the contact identifier to match.",
      schema: {
        identifier: z
          .string()
          .describe("The contact's identifier. Can be the contact's ID, email, or phone number."),
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
            "The contact's language code, based on the ISO 639-1 standard (e.g., 'en' for English)."
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
        const { identifier, firstName, lastName, phone, email, language, custom_fields } = args as {
          identifier: string;
          firstName: string;
          lastName?: string | null;
          phone?: string | null;
          email?: string | null;
          language?: string | null;
          custom_fields?: CustomFieldValue[];
        };
        const data: ContactFields = { firstName, lastName, phone, email, language, custom_fields };
        try {
          const sdkClient = createSdkClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const formattedIdentifier = formatContactIdentifier(identifier);
          const result = await sdkClient.contacts.createOrUpdate(formattedIdentifier, data);
          return handleSdkResponse(result);
        } catch (error) {
          return handleSdkError(error);
        }
      },
    },
    {
      name: "merge_contacts",
      description:
        "Merge two contacts. The primary contact is kept; the secondary is merged into it. Optionally update fields on the primary.",
      schema: {
        primaryContactId: z
          .number()
          .describe("The contact ID of the contact to keep (primary). Must be numeric ID."),
        secondaryContactId: z
          .number()
          .describe("The contact ID of the contact to merge into the primary (secondary)."),
        firstName: z.string().optional().describe("Update the primary contact's first name."),
        lastName: z.string().optional().describe("Update the primary contact's last name."),
        email: z.string().optional().describe("Update the primary contact's email."),
        phone: z.string().optional().describe("Update the primary contact's phone."),
      },
      handler: async (args, ctx) => {
        const { primaryContactId, secondaryContactId, firstName, lastName, email, phone } =
          args as {
            primaryContactId: number;
            secondaryContactId: number;
            firstName?: string;
            lastName?: string;
            email?: string;
            phone?: string;
          };
        try {
          const sdkClient = createSdkClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const request = {
            contactIds: [primaryContactId, secondaryContactId] as [number, number],
            ...(firstName !== undefined && { firstName }),
            ...(lastName !== undefined && { lastName }),
            ...(email !== undefined && { email }),
            ...(phone !== undefined && { phone }),
          };
          const result = await sdkClient.contacts.merge(request);
          return handleSdkResponse(result);
        } catch (error) {
          return handleSdkError(error);
        }
      },
    },
    {
      name: "list_contact_channels",
      description: "List all messaging channels connected to a contact (e.g. WhatsApp, Facebook).",
      schema: {
        identifier: z
          .string()
          .describe("The contact's identifier. Can be the contact's ID, email, or phone number."),
        limit: z
          .number()
          .min(1)
          .max(100)
          .default(10)
          .describe("The number of channels to return, between 1 and 100."),
        cursorId: z.number().optional().describe("The cursor ID for pagination."),
      },
      handler: async (args, ctx) => {
        const {
          identifier,
          limit = 10,
          cursorId,
        } = args as {
          identifier: string;
          limit?: number;
          cursorId?: number;
        };
        try {
          const sdkClient = createSdkClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const formattedIdentifier = formatContactIdentifier(identifier);
          const result = await sdkClient.contacts.listChannels(formattedIdentifier, {
            limit,
            cursorId,
          });
          return handleSdkResponse(result);
        } catch (error) {
          return handleSdkError(error);
        }
      },
    },
    {
      name: "update_contact_lifecycle",
      description:
        "Update a contact's lifecycle stage, or remove the lifecycle (pass stage as null or empty to clear).",
      schema: {
        identifier: z
          .string()
          .describe("The contact's identifier. Can be the contact's ID, email, or phone number."),
        stage: z
          .string()
          .nullable()
          .describe(
            "The lifecycle stage name to set. Set to null or omit to remove the contact's lifecycle."
          ),
      },
      handler: async (args, ctx) => {
        const { identifier, stage } = args as { identifier: string; stage: string | null };
        try {
          const sdkClient = createSdkClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const formattedIdentifier = formatContactIdentifier(identifier);
          // API accepts null to remove lifecycle; SDK types may not reflect this
          type LifecycleRequest = Parameters<typeof sdkClient.contacts.updateLifecycle>[1];
          const request: LifecycleRequest =
            stage == null || stage === "" ? (null as unknown as LifecycleRequest) : { name: stage };
          const result = await sdkClient.contacts.updateLifecycle(formattedIdentifier, request);
          return handleSdkResponse(result);
        } catch (error) {
          return handleSdkError(error);
        }
      },
    },
  ];
}
