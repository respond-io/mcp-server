import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MCPServerOptions, Tool } from "../types.js";

/**
 * Abstract base class for creating tools to register with the MCP server.
 * It simplifies tool creation by handling common initialization and registration logic.
 */
export abstract class BaseTool {
  /**
   * An array of tool definitions to be registered with the MCP server.
   * Each tool definition includes its name, description, schema, and handler.
   */
  protected abstract tools: Tool[];

  /**
   * The base URL for the API, used by all tools.
   */
  protected readonly apiBaseUrl: string;

  /**
   * A flag indicating whether debug mode is enabled.
   */
  protected readonly debug: boolean;

  /**
   * The mode in which the server is running, either "http" or "stdio."
   */
  protected readonly mode: "http" | "stdio";

  /**
   * Initializes the BaseTool with the given server options.
   * @param {MCPServerOptions} options - The server options, including the API base URL, API token, debug flag, and mode.
   */
  constructor({ apiBaseUrl, debug, mode }: MCPServerOptions) {
    this.apiBaseUrl = apiBaseUrl;
    this.debug = debug;
    this.mode = mode;
  }

  /**
   * Registers all the tools defined in the `tools` array with the MCP server.
   * This method iterates over the `tools` array and registers each tool
   * with the server using its name, description, schema, and handler.
   * @param {McpServer} server - The MCP server instance to register the tools with.
   */
  public register(server: McpServer): void {
    for (const { name, description, schema, handler } of this.tools) {
      server.tool(name, description, schema, handler);
    }
  }
}
