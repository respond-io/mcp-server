import axios, { AxiosInstance, AxiosError, AxiosResponse } from "axios";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Ctx } from "../types.js";

/**
 * Creates a new Axios API client.
 *
 * @param {string} apiBaseUrl - The base URL for the API.
 * @returns {AxiosInstance} - An Axios instance configured with the base URL, authorization headers, and a timeout.
 * @throws {Error} - Throws an error if the API base URL or token is not set.
 */
export const createApiClient = (apiBaseUrl: string, mode: string, ctx: Ctx): AxiosInstance => {
  const apiToken =
    mode === "http" && ctx?.requestInfo?.headers?.authorization
      ? ctx.requestInfo.headers.authorization
      : process.env.RESPONDIO_API_KEY;

  if (!apiBaseUrl) {
    throw new Error("RESPONDIO_BASE_URL is not set in the environment");
  }
  if (!apiToken) {
    throw new Error("RESPONDIO_API_KEY is not set in the environment");
  }

  const cleanToken = apiToken.startsWith("Bearer ") ? apiToken.slice(7) : apiToken;

  return axios.create({
    baseURL: apiBaseUrl,
    headers: {
      Authorization: `Bearer ${cleanToken}`,
      "Content-Type": "application/json",
    },
    timeout: 30_000,
  });
};

/**
 * Converts a string to a `CallToolResult` object with a text content type.
 *
 * @param {string} text - The text to be converted.
 * @returns {CallToolResult} - A `CallToolResult` object.
 */
const asCallToolText = (text: string): CallToolResult => ({
  content: [{ type: "text", text }],
});

/**
 * Safely stringifies a value, handling circular references and BigInts.
 *
 * @param {unknown} data - The data to be stringified.
 * @returns {string} - The stringified data.
 */
function safeStringify(data: unknown): string {
  const seen = new WeakSet();
  return JSON.stringify(
    data,
    (_k, v) => {
      if (typeof v === "bigint") {
        return v.toString();
      }
      if (v && typeof v === "object") {
        if (seen.has(v as object)) {
          return "[Circular]";
        }
        seen.add(v as object);
      }
      return v as unknown;
    },
    2
  );
}

/**
 * Handles a successful API response by stringifying the data and returning it as a `CallToolResult`.
 *
 * @param {AxiosResponse} response - The Axios response object.
 * @returns {CallToolResult} - A `CallToolResult` object containing the stringified response data.
 */
export const handleApiResponse = (response: AxiosResponse): CallToolResult => {
  if (!response || typeof response.data === "undefined") {
    return asCallToolText("No data returned from API.");
  }
  return asCallToolText(safeStringify(response.data as unknown));
};

/**
 * Handles an API error by creating a descriptive error message and returning it as a `CallToolResult`.
 *
 * @param {unknown} error - The error object.
 * @returns {CallToolResult} - A `CallToolResult` object containing the error message.
 */
export const handleApiError = (error: unknown): CallToolResult => {
  let message: string;

  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<{ code?: number; message?: string }>;
    if (err.response) {
      message = `API Error ${err.response.status}: ${err.response.data?.message || err.message || "Unknown error"}`;
    } else if (err.request) {
      message = `Network Error: ${err.message}`;
    } else {
      message = `Axios Error: ${err.message}`;
    }
  } else if (error instanceof Error) {
    message = `Error: ${error.message}`;
  } else {
    message = `Unknown Error: ${String(error)}`;
  }

  if (process.env.DEBUG && error instanceof Error && error.stack) {
    message += `\nStack: ${error.stack}`;
  }

  return asCallToolText(message);
};
