import { z } from "zod";
import { AxiosError, AxiosResponse } from "axios";
import { BaseTool } from "./BaseTool.js";
import { createApiClient, handleApiError, handleApiResponse } from "../utils/api.js";
import { GetMessageArgs, MessagePayload, SendMessageArgs, Tool, ToolArgs } from "../types.js";

/**
 * A tool for sending and retrieving messages.
 * This tool provides functionalities for sending various types of messages to a contact
 * and retrieving a specific message by its ID.
 */
export class MessagingTool extends BaseTool {
  /**
   * The list of tools provided by the MessagingTool.
   * It includes tools for sending a message and getting a message.
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
          .describe("The language code of the WhatsApp template."),
      },
      handler: async (args: ToolArgs, ctx: any) => {
        const { identifier, channelId, messageType, ...messageData } = args as SendMessageArgs;
        try {
          let message: MessagePayload;

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
                  components: [],
                },
              };
              break;
            default:
              throw new Error(`Unsupported message type: ${messageType}`);
          }

          const apiClient = createApiClient(this.apiBaseUrl, this.mode, ctx);
          const response: AxiosResponse = await apiClient.post(`/contact/${identifier}/message`, {
            channelId,
            message,
          });
          return handleApiResponse(response);
        } catch (error) {
          return handleApiError(error as AxiosError);
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
      handler: async (args: ToolArgs, ctx: any) => {
        const { identifier, messageId } = args as GetMessageArgs;
        try {
          const apiClient = createApiClient(this.apiBaseUrl, this.mode, ctx);
          const response: AxiosResponse = await apiClient.get(
            `/contact/${identifier}/message/${messageId}`
          );
          return handleApiResponse(response);
        } catch (error) {
          return handleApiError(error as AxiosError);
        }
      },
    },
  ];
}
