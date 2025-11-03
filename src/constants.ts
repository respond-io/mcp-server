/**
 * Constants for the Respond.io MCP Server
 */

export const APP_CONFIG = {
  PORT: Number(process.env.PORT || 3000),
  debug: false,
} as const;

export const API_CONFIG = {
  BASE_URL: process.env.RESPONDIO_BASE_URL || "https://api.respond.io/v2",
  TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MIN_LIMIT: 1,
  MAX_LIMIT: 100,
} as const;

export const FIELD_LIMITS = {
  CUSTOM_FIELD_NAME_MAX_LENGTH: 50,
  CUSTOM_FIELD_SLUG_MAX_LENGTH: 50,
  CUSTOM_FIELD_DESCRIPTION_MAX_LENGTH: 255,
  TAG_MAX_LENGTH: 255,
  TAG_MAX_COUNT: 10,
  COMMENT_MAX_LENGTH: 1000,
  CLOSING_NOTE_CATEGORY_MAX_LENGTH: 128,
  CLOSING_NOTE_SUMMARY_MAX_LENGTH: 512,
} as const;

export const MESSAGE_TYPES = [
  "text",
  "attachment",
  "whatsapp_template",
  "email",
  "quick_reply",
  "custom_payload",
] as const;

export const ATTACHMENT_TYPES = ["image", "video", "audio", "file"] as const;

export const CUSTOM_FIELD_DATA_TYPES = [
  "text",
  "list",
  "checkbox",
  "email",
  "number",
  "url",
  "date",
  "time",
] as const;

export const CONVERSATION_STATUSES = ["open", "close"] as const;

export const USER_ROLES = ["agent", "manager", "owner"] as const;

export const CHANNEL_SOURCES = [
  "facebook",
  "instagram",
  "line",
  "telegram",
  "viber",
  "twitter",
  "wechat",
  "custom_channel",
  "gmail",
  "other_email",
  "twilio",
  "message_bird",
  "nexmo",
  "360dialog_whatsapp",
  "twilio_whatsapp",
  "message_bird_whatsapp",
  "whatsapp",
  "nexmo_whatsapp",
  "whatsapp_cloud",
] as const;

export const MESSAGE_STATUSES = ["pending", "sent", "delivered", "read", "failed"] as const;

export const FILTER_OPERATORS = [
  "isEqualTo",
  "isNotEqualTo",
  "isTimestampAfter",
  "isTimestampBefore",
  "isTimestampBetween",
  "exists",
  "doesNotExist",
  "isGreaterThan",
  "isLessThan",
  "isBetween",
  "hasAnyOf",
  "hasAllOf",
  "hasNoneOf",
] as const;

export const FILTER_CATEGORIES = ["contactField", "contactTag", "lifecycle"] as const;

export const FACEBOOK_MESSAGE_TAGS = [
  "ACCOUNT_UPDATE",
  "POST_PURCHASE_UPDATE",
  "CONFIRMED_EVENT_UPDATE",
] as const;

export const ERROR_CODES = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMIT: 429,
  REQUEST_QUEUED: 449,
  SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  INVALID_API_KEY: "Invalid or missing API key",
  INVALID_IDENTIFIER:
    "Invalid identifier format. Use 'id:123', 'email:user@example.com', or 'phone:+1234567890'",
  INVALID_EMAIL: "Invalid email format",
  INVALID_PHONE: "Invalid phone number format. Use E.164 format (e.g., +60123456789)",
  INVALID_URL: "Invalid URL format",
  INVALID_LANGUAGE_CODE: "Invalid language code. Use ISO 639-1 format (e.g., 'en', 'ms')",
  INVALID_COUNTRY_CODE: "Invalid country code. Use ISO 3166-1 alpha-2 format (e.g., 'MY', 'US')",
  MISSING_REQUIRED_FIELD: "Missing required field",
  TAG_TOO_LONG: `Tag exceeds maximum length of ${FIELD_LIMITS.TAG_MAX_LENGTH} characters`,
  TOO_MANY_TAGS: `Cannot add more than ${FIELD_LIMITS.TAG_MAX_COUNT} tags`,
  COMMENT_TOO_LONG: `Comment exceeds maximum length of ${FIELD_LIMITS.COMMENT_MAX_LENGTH} characters`,
} as const;

export const HTTP_STATUS_DESCRIPTIONS = {
  200: "OK",
  400: "Bad Request",
  401: "Unauthorized",
  404: "Not Found",
  409: "Conflict",
  429: "Too Many Requests",
  449: "Retry With",
  500: "Internal Server Error",
} as const;

export const REGEX_PATTERNS = {
  IDENTIFIER_ID: /^id:\d+$/,
  IDENTIFIER_EMAIL: /^email:.+@.+\..+$/,
  IDENTIFIER_PHONE: /^phone:\+?\d+$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_E164: /^\+[1-9]\d{1,14}$/,
  ISO_DATE: /^\d{4}-\d{2}-\d{2}$/,
  TIME_24H: /^([01]\d|2[0-3]):([0-5]\d)$/,
  LANGUAGE_CODE: /^[a-z]{2}$/i,
  COUNTRY_CODE: /^[A-Z]{2}$/,
  SLUG: /^[a-zA-Z0-9_]+$/,
} as const;

export const DEFAULT_TIMEZONE = "UTC";

export const SERVER_INFO = {
  NAME: "respondio-mcp-server",
  VERSION: "1.0.0",
  DESCRIPTION: "Model Context Protocol server for Respond.io API",
} as const;
