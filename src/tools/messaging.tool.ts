import { z } from "zod";
import { BaseTool } from "./BaseTool.js";
import {
  createSdkClient,
  formatContactIdentifier,
  handleSdkError,
  handleSdkResponse,
} from "../utils/api.js";
import { Message, TemplateComponent } from "@respond-io/typescript-sdk";
import { Ctx, Tool } from "../types.js";

const templateParameterSchema = z.object({
  type: z.enum(["text", "image", "video", "document", "location"]).describe("The parameter type."),
  text: z.string().optional().describe("Text value, required when type is 'text'."),
  image: z
    .object({ link: z.string(), caption: z.string().optional(), filename: z.string().optional() })
    .optional()
    .describe("Image object with a public URL, required when type is 'image'."),
  video: z
    .object({ link: z.string(), caption: z.string().optional(), filename: z.string().optional() })
    .optional()
    .describe("Video object with a public URL, required when type is 'video'."),
  document: z
    .object({ link: z.string(), caption: z.string().optional(), filename: z.string() })
    .optional()
    .describe("Document object with a public URL, required when type is 'document'."),
  location: z
    .object({
      name: z.string(),
      address: z.string(),
      latitude: z.string(),
      longitude: z.string(),
    })
    .optional()
    .describe("Location object, required when type is 'location'."),
});

const templateComponentSchema = z.object({
  type: z
    .enum(["header", "body", "footer", "buttons"])
    .describe("The component type: 'header', 'body', 'footer', or 'buttons'."),
  format: z
    .enum(["text", "image", "video", "document", "location"])
    .optional()
    .describe("Media format, applicable for 'header' components with media."),
  text: z.string().optional().describe("Static text for the component (rarely needed)."),
  parameters: z
    .array(templateParameterSchema)
    .optional()
    .describe(
      "Dynamic variable values for the component. Use one parameter per template variable ({{1}}, {{2}}, etc.)."
    ),
  buttons: z
    .array(
      z.object({
        type: z
          .enum(["quick_reply", "phone_number", "url", "catalog", "mpm"])
          .describe("Button type."),
        text: z.string().optional().describe("Button label text."),
        phone_number: z.string().optional().describe("Phone number for 'phone_number' buttons."),
        url: z.string().optional().describe("URL for 'url' buttons."),
        parameters: z
          .array(z.object({ type: z.string(), text: z.string().optional() }))
          .optional()
          .describe("Dynamic parameters for the button (e.g. URL suffix for 'url' buttons)."),
      })
    )
    .optional()
    .describe("Button definitions, applicable for 'buttons' components."),
});

/**
 * A tool for sending and retrieving messages.
 * This tool provides functionalities for sending various types of messages to a contact,
 * retrieving a specific message by its ID, and listing messages for a contact.
 */
export class MessagingTool extends BaseTool {
  /**
   * The list of tools provided by the MessagingTool.
   * It includes tools for sending a message, getting a message, and listing messages.
   */
  protected tools: Tool[] = [
    {
      name: "send_message",
      description: "Send a message to a contact through a specific channel.",
      schema: {
        identifier: z
          .string()
          .describe("The contact's identifier. Can be the contact's ID, email, or phone number."),
        channelId: z
          .number()
          .nullable()
          .optional()
          .describe(
            "The channel ID to send the message from. If null, the last interacted channel will be used."
          ),
        messageType: z
          .enum(["text", "attachment", "whatsapp_template", "email", "quick_reply"])
          .describe("The type of message to send."),
        text: z
          .string()
          .optional()
          .describe("The message text, required for 'text' and 'email' message types."),
        subject: z
          .string()
          .optional()
          .describe("The email subject, required for 'email' message types."),
        attachmentUrl: z
          .string()
          .optional()
          .describe("The URL of the attachment, required for 'attachment' message types."),
        attachmentType: z
          .enum(["image", "video", "audio", "file"])
          .optional()
          .describe("The type of the attachment."),
        templateName: z
          .string()
          .optional()
          .describe(
            "The name of the WhatsApp template, required for 'whatsapp_template' message types."
          ),
        templateLanguage: z
          .string()
          .optional()
          .describe("The language code of the WhatsApp template, e.g. 'en', 'en_US'."),
        templateComponents: z
          .array(templateComponentSchema)
          .optional()
          .describe(
            "Dynamic components for the WhatsApp template. Use this to fill in variable values " +
              "({{1}}, {{2}}, etc.) in the template body, header, or buttons. " +
              "Example: [{ type: 'body', parameters: [{ type: 'text', text: 'John' }, { type: 'text', text: 'ORDER-123' }] }]. " +
              "Omit if the template has no dynamic variables."
          ),
      },
      handler: async (args, ctx) => {
        const { identifier, channelId, messageType, ...messageData } = args as {
          identifier: string;
          channelId?: number | null;
          messageType: string;
          [key: string]: unknown;
        };
        try {
          const sdkClient = createSdkClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const formattedIdentifier = formatContactIdentifier(identifier);
          let message: Message;

          switch (messageType) {
            case "text":
              message = { type: "text", text: messageData.text as string };
              break;
            case "attachment":
              message = {
                type: "attachment",
                attachment: {
                  type: messageData.attachmentType as "image" | "video" | "audio" | "file",
                  url: messageData.attachmentUrl as string,
                },
              };
              break;
            case "email":
              message = {
                type: "email",
                text: messageData.text as string,
                subject: messageData.subject as string,
              };
              break;
            case "whatsapp_template":
              message = {
                type: "whatsapp_template",
                template: {
                  name: messageData.templateName as string,
                  languageCode: messageData.templateLanguage as string,
                  components: (messageData.templateComponents as TemplateComponent[]) ?? [],
                },
              };
              break;
            default:
              throw new Error(`Unsupported message type: ${messageType}`);
          }

          const result = await sdkClient.messaging.send(formattedIdentifier, {
            channelId,
            message,
          });
          return handleSdkResponse(result);
        } catch (error) {
          return handleSdkError(error);
        }
      },
    },
    {
      name: "get_message",
      description: "Retrieve a message by its ID.",
      schema: {
        identifier: z
          .string()
          .describe("The contact's identifier. Can be the contact's ID, email, or phone number."),
        messageId: z.number().describe("The ID of the message to retrieve."),
      },
      handler: async (args, ctx) => {
        const { identifier, messageId } = args as { identifier: string; messageId: number };
        try {
          const sdkClient = createSdkClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const formattedIdentifier = formatContactIdentifier(identifier);
          const message = await sdkClient.messaging.get(formattedIdentifier, messageId);
          return handleSdkResponse(message);
        } catch (error) {
          return handleSdkError(error);
        }
      },
    },
    {
      name: "list_messages",
      description: "List messages for a contact with optional pagination.",
      schema: {
        identifier: z
          .string()
          .describe("The contact's identifier. Can be the contact's ID, email, or phone number."),
        limit: z
          .number()
          .min(1)
          .max(100)
          .default(20)
          .describe("The number of messages to return, between 1 and 100."),
        cursorId: z.number().optional().describe("The cursor ID for pagination."),
      },
      handler: async (args, ctx) => {
        const {
          identifier,
          limit = 20,
          cursorId,
        } = args as {
          identifier: string;
          limit?: number;
          cursorId?: number;
        };
        try {
          const sdkClient = createSdkClient(this.apiBaseUrl, this.mode, ctx as Ctx);
          const formattedIdentifier = formatContactIdentifier(identifier);
          const result = await sdkClient.messaging.list(formattedIdentifier, {
            limit,
            cursorId,
          });
          return handleSdkResponse(result);
        } catch (error) {
          return handleSdkError(error);
        }
      },
    },
  ];
}
