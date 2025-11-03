import express, { Request, Response, Express } from "express";
import cors from "cors";
import { Server as HttpServer } from "http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "../server.js";
import { tokenVerifier } from "../middlewares/TokenVerifier.js";
import { BaseProtocol } from "./BaseProtocol.js";
import { MCPServerOptions } from "../types.js";
import path from "path";

type InitOptions = {
  port: number;
  apiBaseUrl: string;
  debug: boolean;
  staticDir?: string;
  corsOrigin?: string | string[] | true;
  allowedHeaders?: string;
  sessionIdGenerator?: (() => string) | undefined;
  app?: Express;
};

type InitResult = {
  app: Express;
  httpServer: HttpServer;
  transport: StreamableHTTPServerTransport;
  close: () => Promise<void>;
  port: number;
};

export class HttpStreamProtocol extends BaseProtocol {
  private app?: Express;
  private httpServer?: HttpServer;
  private transport?: StreamableHTTPServerTransport;
  private closing = false;
  private readonly port: number;
  private readonly apiBaseUrl: string;
  private readonly debug: boolean;

  constructor(private readonly options: InitOptions) {
    super();
    this.port = options.port;
    this.apiBaseUrl = options.apiBaseUrl;
    this.debug = options.debug;
  }

  public async init(): Promise<InitResult> {
    if (this.httpServer) {
      return {
        app: this.app!,
        httpServer: this.httpServer,
        transport: this.transport!,
        close: this.close.bind(this),
        port: this.port,
      };
    }

    const app = this.options.app ?? express();

    app.use(express.json());
    app.use(express.static(this.options.staticDir ?? path.join(process.cwd(), "public")));
    app.use(
      cors({
        origin: this.options.corsOrigin ?? true,
        methods: "*",
        allowedHeaders:
          this.options.allowedHeaders ?? "Authorization, Origin, Content-Type, Accept, *",
      })
    );
    app.options("/mcp", cors());

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: this.options.sessionIdGenerator,
    });

    app.get("/health", (_req: Request, res: Response) => {
      res.status(200).json({ status: "ok" });
    });

    app.use("/mcp", tokenVerifier);
    app.post("/mcp", async (req: Request, res: Response) => {
      console.error("Received MCP request:", req.body);
      try {
        await transport.handleRequest(req, res, req.body);
      } catch (error) {
        console.error("Error handling MCP request:", error);
        if (!res.headersSent) {
          res.status(500).json({
            jsonrpc: "2.0",
            error: {
              code: -32603,
              message: "Internal server error",
            },
            id: null,
          });
        }
      }
    });

    const methodNotAllowed = (req: Request, res: Response) => {
      console.error(`Received ${req.method} MCP request`);
      res.status(405).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Method not allowed.",
        },
        id: null,
      });
    };

    app.get("/mcp", methodNotAllowed);
    app.delete("/mcp", methodNotAllowed);

    const { server } = createServer({
      apiBaseUrl: this.apiBaseUrl,
      debug: this.debug,
      mode: "http",
    } as MCPServerOptions);

    try {
      await server.connect(transport);
      console.error("Server connected successfully");
    } catch (error) {
      console.error("Failed to set up the server:", error);
      throw error;
    }

    const httpServer: HttpServer = app.listen(this.port, () => {
      console.error(`MCP Streamable HTTP Server listening on port ${this.port}`);
    });

    const onSigInt = async () => {
      console.error("Shutting down server...");
      await this.close().catch((err) => console.error("Error during shutdown:", err));
      process.exit(0);
    };

    process.on("SIGINT", () => void onSigInt());
    process.on("SIGTERM", () => void onSigInt());

    this.app = app;
    this.httpServer = httpServer;
    this.transport = transport;

    const originalClose = this.close.bind(this);
    this.close = async () => {
      if (this.closing) {
        return;
      }
      this.closing = true;

      try {
        console.error("Closing transport");
        await transport.close();
      } catch (error) {
        console.error("Error closing transport:", error);
      }

      try {
        await server.close();
        console.error("Server shutdown complete");
      } catch (error) {
        console.error("Error closing server:", error);
      }

      await originalClose();
    };

    return {
      app,
      httpServer,
      transport,
      close: this.close.bind(this),
      port: this.port,
    };
  }

  public async close(): Promise<void> {
    if (!this.httpServer) {
      return;
    }
    await new Promise<void>((resolve, reject) => {
      this.httpServer!.close((err) => (err ? reject(err) : resolve()));
    });
    this.httpServer = undefined;
  }
}
