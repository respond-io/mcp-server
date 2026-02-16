#!/usr/bin/env node
import { API_CONFIG, APP_CONFIG } from "./constants.js";
import { HttpStreamProtocol, StdioProtocol } from "./protocol/index.js";
import { initializeClientMonitoring } from "./utils/api.js";

/**
 * Initializes and starts the appropriate protocol based on the `MCP_SERVER_MODE` environment variable.
 * If `MCP_SERVER_MODE` is set to "http", the `HttpStreamProtocol` is used; otherwise, the `StdioProtocol` is used.
 * The configuration is sourced from environment variables, with fallback to default values from the application and API configurations.
 *
 * @throws {Error} If the protocol fails to start, an error is logged to the console, and the process exits with a non-zero status code.
 */
const startServer = async () => {
  const isHttpMode = process.env.MCP_SERVER_MODE === "http";

  if (!isHttpMode && !API_CONFIG.API_KEY) {
    console.error("RESPONDIO_API_KEY is not set in the environment");
    process.exit(1);
  }

  const protocol = isHttpMode
    ? new HttpStreamProtocol({
        port: process.env.PORT ? parseInt(process.env.PORT) : APP_CONFIG.PORT,
        apiBaseUrl: process.env.RESPONDIO_BASE_URL || API_CONFIG.BASE_URL,
        debug: process.env.DEBUG === "true" || APP_CONFIG.debug,
      })
    : new StdioProtocol({
        apiBaseUrl: process.env.RESPONDIO_BASE_URL || API_CONFIG.BASE_URL,
        debug: process.env.DEBUG === "true" || APP_CONFIG.debug,
      });

  try {
    await protocol.init();
    // Initialize client monitoring after protocol is ready
    initializeClientMonitoring();
    console.warn("Respond.io MCP Server started successfully");
  } catch (err) {
    console.error("Failed to start protocol:", err);
    process.exit(1);
  }
};

void startServer();
