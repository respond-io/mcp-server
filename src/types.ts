import type { ZodRawShape, ZodTypeAny } from "zod";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

/**
 * Type definitions for Respond.io API
 */

export interface Config {
  apiKey: string;
  baseUrl: string;
}

// Contact Types
export interface Contact {
  id: number;
  firstName: string;
  lastName?: string;
  phone?: string;
  email?: string;
  language?: string;
  profilePic?: string;
  countryCode?: string;
  custom_fields?: CustomField[];
  status: "open" | "close";
  tags?: string[];
  assignee?: User | null;
  lifecycle?: string | null;
  created_at: number;
}

export interface CustomField {
  name: string;
  value: string | number | boolean | null;
}

export interface ContactFields {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  language?: string;
  profilePic?: string;
  countryCode?: string;
  custom_fields?: CustomField[];
}

export interface ContactFilter {
  search?: string;
  timezone?: string;
  filter: {
    $and?: FilterCondition[];
    $or?: FilterCondition[];
  };
}

export interface FilterCondition {
  category: "contactField" | "contactTag" | "lifecycle";
  field?: string | null;
  operator:
    | "isEqualTo"
    | "isNotEqualTo"
    | "isTimestampAfter"
    | "isTimestampBefore"
    | "isTimestampBetween"
    | "exists"
    | "doesNotExist"
    | "isGreaterThan"
    | "isLessThan"
    | "isBetween"
    | "hasAnyOf"
    | "hasAllOf"
    | "hasNoneOf";
  value?: string | string[] | { from: string; to: string } | null;
}

// User Types
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role?: "agent" | "manager" | "owner";
  team?: {
    id: number;
    name: string;
  } | null;
  restrictions?: string[];
}

// Message Types
export type MessageType =
  | "text"
  | "attachment"
  | "whatsapp_template"
  | "email"
  | "quick_reply"
  | "custom_payload";

export interface TextMessage {
  type: "text";
  text: string;
  messageTag?: "ACCOUNT_UPDATE" | "POST_PURCHASE_UPDATE" | "CONFIRMED_EVENT_UPDATE";
}

export interface AttachmentMessage {
  type: "attachment";
  attachment: {
    type: "image" | "video" | "audio" | "file";
    url: string;
  };
}

export interface EmailMessage {
  type: "email";
  text: string;
  subject: string;
  bcc?: string[];
  cc?: string[];
  replyToMessageId?: number;
  attachments?: Array<{
    type: "image" | "video" | "audio" | "file";
    url: string;
    fileName: string;
  }>;
}

export interface WhatsAppTemplateMessage {
  type: "whatsapp_template";
  template: {
    name: string;
    languageCode: string;
    components?: TemplateComponent[];
  };
}

export interface QuickReplyMessage {
  type: "quick_reply";
  title: string;
  replies: string[];
}

export interface CustomPayloadMessage {
  type: "custom_payload";
  payload: Record<string, unknown>;
}

export type Message =
  | TextMessage
  | AttachmentMessage
  | EmailMessage
  | WhatsAppTemplateMessage
  | QuickReplyMessage
  | CustomPayloadMessage;

export type MessagePayload =
  | TextMessage
  | AttachmentMessage
  | EmailMessage
  | WhatsAppTemplateMessage;

export interface TemplateComponent {
  type: "header" | "body" | "footer" | "buttons";
  format?: "text" | "image" | "video" | "document" | "location";
  text?: string;
  parameters?: TemplateParameter[];
  buttons?: TemplateButton[];
}

export interface TemplateParameter {
  type: "text" | "image" | "video" | "document" | "location";
  text?: string;
  image?: {
    link: string;
    caption?: string;
    filename?: string;
  };
  video?: {
    link: string;
    caption?: string;
    filename: string;
  };
  document?: {
    link: string;
    caption?: string;
    filename: string;
  };
  location?: {
    name: string;
    address: string;
    latitude: string;
    longitude: string;
  };
}

export interface TemplateButton {
  type: "quick_reply" | "phone_number" | "url" | "catalog" | "mpm";
  text: string;
  phone_number?: string;
  url?: string;
  parameters?: Array<{
    type: string;
    text?: string;
    action?: Record<string, unknown>;
  }>;
}

export interface MessageStatus {
  value: "pending" | "sent" | "delivered" | "read" | "failed";
  timestamp: number;
  message?: string;
}

// Channel Types
export interface Channel {
  id: number;
  name: string;
  source:
    | "facebook"
    | "instagram"
    | "line"
    | "telegram"
    | "viber"
    | "twitter"
    | "wechat"
    | "custom_channel"
    | "gmail"
    | "other_email"
    | "twilio"
    | "message_bird"
    | "nexmo"
    | "360dialog_whatsapp"
    | "twilio_whatsapp"
    | "message_bird_whatsapp"
    | "whatsapp"
    | "nexmo_whatsapp"
    | "whatsapp_cloud";
  created_at: number;
}
export interface JWTPayload {
  iat: number;
  id: number;
  spaceId: number;
  type: string;
  orgId: number;
}

export interface ContactChannel extends Channel {
  meta?: Record<string, unknown>;
  lastMessageTime?: number;
  lastIncomingMessageTime?: number;
}

// Custom Field Types
export interface ContactFieldDefinition {
  id: number;
  name: string;
  description?: string;
  dataType: "text" | "list" | "checkbox" | "email" | "number" | "url" | "date" | "time";
  allowedValues?: string[];
}

// Closing Note Types
export interface ClosingNote {
  category: string;
  description?: string;
}

// Comment Types
export interface Comment {
  contactId: number;
  text: string;
  created_at: number;
}

// Tag Types
export interface SpaceTag {
  id: number;
  name: string;
  description?: string;
  emoji?: string;
  colorCode?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  status: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    next: string;
    previous: string;
  };
}

export interface ApiError {
  code: number;
  message: string;
}

// Tool argument types
export interface GetContactArgs {
  identifier: string;
}

export interface CreateContactArgs {
  identifier: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  language?: string;
  custom_fields?: CustomField[];
}

export interface UpdateContactArgs {
  identifier: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  language?: string;
  custom_fields?: CustomField[];
}

export interface ListContactsArgs {
  limit?: number;
  cursorId?: number;
  search?: string;
  timezone?: string;
}

export interface TagOperationArgs {
  identifier: string;
  tags: string[];
}

export interface SendMessageArgs {
  identifier: string;
  channelId?: number | null;
  messageType: MessageType;
  text?: string;
  subject?: string;
  attachmentUrl?: string;
  attachmentType?: "image" | "video" | "audio" | "file";
  templateName?: string;
  templateLanguage?: string;
  templateComponents?: TemplateComponent[];
}

export interface GetMessageArgs {
  identifier: string;
  messageId: number;
}

export interface ListMessagesArgs extends PaginationArgs {
  identifier: string;
  channelId?: number | null;
}

export interface AssignConversationArgs {
  identifier: string;
  assignee: string | null;
}

export interface UpdateConversationStatusArgs {
  identifier: string;
  status: "open" | "close";
  category?: string;
  summary?: string;
}

export interface CreateCommentArgs {
  identifier: string;
  text: string;
}

export interface CreateCustomFieldArgs {
  name: string;
  slug?: string;
  description?: string;
  dataType: "text" | "list" | "checkbox" | "email" | "number" | "url" | "date" | "time";
  allowedValues?: string[];
}

export interface PaginationArgs {
  limit?: number;
  cursorId?: number;
}

export type MCPServerOptions = {
  apiBaseUrl: string;
  apiToken?: string;
  debug: boolean;
  mode: "http" | "stdio";
};

export type ToolArgs = Record<string, any>;

export type ToolHandler = (
  args: ToolArgs,
  ctx?: unknown
) => Promise<CallToolResult> | CallToolResult;

export interface Tool {
  name: string;
  description: string;
  schema: ZodRawShape;
  handler: ToolHandler;
}

export type ToolManifestEntry = [
  /** name */ string,
  /** description */ string,
  /** zod schema */ ZodRawShape,
  /** handler */ ToolHandler,
];

export interface ToolServer {
  tool: (
    name: string,
    options: { description: string; parameters: ZodTypeAny },
    handler: ToolHandler
  ) => void;
}

export interface Ctx {
  signal: AbortSignal;
  sessionId?: string;
  _meta?: {
    progressToken?: number;
    [k: string]: unknown;
  };
  sendNotification?: (...args: any[]) => any;
  sendRequest?: (...args: any[]) => any;
  authInfo?: unknown;
  requestId: number;
  requestInfo: {
    headers: {
      host: string;
      connection: string;
      "content-length": string;
      "sec-ch-ua-platform": string;
      authorization?: string; // Bearer token
      "sec-ch-ua": string;
      "sec-ch-ua-mobile": string;
      "mcp-protocol-version"?: string;
      "user-agent": string;
      accept: string;
      "content-type": string;
      origin?: string;
      "sec-fetch-site"?: string;
      "sec-fetch-mode"?: string;
      "sec-fetch-dest"?: string;
      referer?: string;
      "accept-encoding"?: string;
      "accept-language"?: string;
      [k: string]: string | undefined;
    };
  };
}
