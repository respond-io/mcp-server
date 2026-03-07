import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ContactsTool } from "./tools/index.js";
import { MessagingTool } from "./tools/messaging.tool.js";
import { ConversationTool } from "./tools/conversation.tool.js";
import { CommentTool } from "./tools/comment.tool.js";
import { WorkspaceTool } from "./tools/workspace.tool.js";
import { MCPServerOptions } from "./types.js";
import { API_CONFIG, isMultiWorkspace, getWorkspaceNames } from "./constants.js";
import { handleSdkResponse } from "./utils/api.js";

/**
 * Creates and configures the MCP server.
 * This function initializes the MCP server, registers all the available tools, and returns the server instance.
 *
 * @param {MCPServerOptions} options - The options for configuring the server, including the API base URL, debug mode, and server mode.
 * @returns {{ server: McpServer }} - An object containing the configured MCP server instance.
 */
export const createServer = (options: MCPServerOptions) => {
  // Print startup configuration (excluding sensitive info)
  console.error(`[INFO] Respond.io MCP Server starting...
      API Base: ${API_CONFIG.BASE_URL}
      Debug: ${options.debug ? "enabled" : "disabled"}
      Mode: ${options.mode}
      ${options.mode === "http" ? `HTTP mode on HTTP port: ${process.env.PORT}` : options.mode === "stdio" ? `STDIO mode` : ""}
    `);

  // Create server instance
  const server = new McpServer({
    name: "Respond.io MCP Server",
    version: "1.0.1",
  });

  // Register all the tools with the server
  new ContactsTool(options).register(server);
  new MessagingTool(options).register(server);
  new ConversationTool(options).register(server);
  new CommentTool(options).register(server);
  new WorkspaceTool(options).register(server);

  // Register list_workspaces tool only in multi-workspace mode
  if (isMultiWorkspace()) {
    server.tool(
      "list_workspaces",
      "List all configured workspaces and which one is the default.",
      {
        _dummy: z.string().optional().describe("No parameters required."),
      },
      async () => {
        const names = getWorkspaceNames();
        const result = names.map((name) => ({
          name,
          isDefault: name === API_CONFIG.DEFAULT_WORKSPACE,
        }));
        return handleSdkResponse(result);
      }
    );
  }

  return { server };
};
