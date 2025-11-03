import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "../server.js";
import { BaseProtocol } from "./BaseProtocol.js";
import { MCPServerOptions } from "../types.js";

type InitOptions = {
  apiBaseUrl: string;
  debug: boolean;
};

export class StdioProtocol extends BaseProtocol {
  private readonly apiBaseUrl: string;
  private readonly debug: boolean;

  constructor(options: InitOptions) {
    super();
    this.apiBaseUrl = options.apiBaseUrl;
    this.debug = options.debug;
  }

  public async init(): Promise<void> {
    const transport = new StdioServerTransport();

    const { server } = createServer({
      apiBaseUrl: this.apiBaseUrl,
      debug: this.debug,
      mode: "stdio",
    } as MCPServerOptions);

    try {
      await server.connect(transport);
      console.error("MCP STDIO Server listening");
    } catch (error) {
      console.error("Failed to set up the server:", error);
      throw error;
    }
  }

  public async close(): Promise<void> {
    // No-op for STDIO
  }
}
