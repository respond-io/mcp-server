import { RespondIO, RespondIOError, type ContactIdentifier } from "@respond-io/typescript-sdk";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Ctx } from "../types.js";

/**
 * Configuration for SDK client creation
 */
interface ClientConfig {
  apiToken: string;
  baseUrl: string;
  maxRetries?: number;
  timeout?: number;
}

/**
 * Client health status
 */
interface ClientHealth {
  isHealthy: boolean;
  lastChecked: Date;
  errorCount: number;
  responseTime?: number;
}

/**
 * Enhanced SDK Client Manager with best practices
 */
class SdkClientManager {
  private static instance: SdkClientManager;
  private clients: Map<string, RespondIO> = new Map();
  private healthStatus: Map<string, ClientHealth> = new Map();
  private healthCheckInterval?: NodeJS.Timeout;
  private readonly defaultConfig: Partial<ClientConfig> = {
    maxRetries: 3,
    timeout: 30000,
  };

  private constructor() {
    // Start periodic health checks
    this.startHealthChecks();
    // Handle graceful shutdown
    this.setupGracefulShutdown();
  }

  static getInstance(): SdkClientManager {
    if (!SdkClientManager.instance) {
      SdkClientManager.instance = new SdkClientManager();
    }
    return SdkClientManager.instance;
  }

  /**
   * Create a client key for caching
   * Uses a hash of the token to avoid collisions while keeping keys readable
   */
  private createClientKey(config: ClientConfig): string {
    // Use first 8 chars + last 4 chars + length to reduce collision risk
    const tokenPreview =
      config.apiToken.length > 12
        ? `${config.apiToken.substring(0, 8)}...${config.apiToken.substring(config.apiToken.length - 4)}`
        : config.apiToken.substring(0, 12);
    return `${config.baseUrl}:${tokenPreview}`;
  }

  /**
   * Get or create an SDK client with enhanced configuration
   */
  getClient(config: ClientConfig): RespondIO {
    const key = this.createClientKey(config);

    if (this.clients.has(key)) {
      const client = this.clients.get(key)!;
      // Check if client is healthy
      const health = this.healthStatus.get(key);
      if (health && !health.isHealthy && this.shouldRecreateClient(health)) {
        console.warn(`Recreating unhealthy client for ${config.baseUrl}`);
        this.clients.delete(key);
        this.healthStatus.delete(key);
      } else {
        return client;
      }
    }

    // Create new client with merged configuration
    const fullConfig = { ...this.defaultConfig, ...config };
    const client = new RespondIO(fullConfig);

    // Cache the client
    this.clients.set(key, client);
    this.healthStatus.set(key, {
      isHealthy: true,
      lastChecked: new Date(),
      errorCount: 0,
    });

    return client;
  }

  /**
   * Determine if a client should be recreated based on health status
   */
  private shouldRecreateClient(health: ClientHealth): boolean {
    const now = new Date();
    const timeSinceLastCheck = now.getTime() - health.lastChecked.getTime();
    // Recreate if unhealthy and checked more than 5 minutes ago, or error count > 5
    return health.errorCount > 5 || timeSinceLastCheck > 5 * 60 * 1000;
  }

  /**
   * Mark a client as unhealthy (called when API calls fail)
   */
  markClientUnhealthy(config: ClientConfig): void {
    const key = this.createClientKey(config);
    const health = this.healthStatus.get(key);
    if (health) {
      health.isHealthy = false;
      health.errorCount++;
      health.lastChecked = new Date();
      console.warn(`Client marked as unhealthy: ${key}, errors: ${health.errorCount}`);
    }
  }

  /**
   * Perform health check on a client
   */
  private async performHealthCheck(key: string, client: RespondIO): Promise<void> {
    const startTime = Date.now();
    try {
      // Perform a lightweight health check (list users with limit 1)
      await client.space.listUsers({ limit: 1 });
      const responseTime = Date.now() - startTime;

      this.healthStatus.set(key, {
        isHealthy: true,
        lastChecked: new Date(),
        errorCount: 0,
        responseTime,
      });
    } catch (error) {
      const health = this.healthStatus.get(key) || { errorCount: 0 };
      this.healthStatus.set(key, {
        isHealthy: false,
        lastChecked: new Date(),
        errorCount: health.errorCount + 1,
        responseTime: Date.now() - startTime,
      });

      console.warn(`Health check failed for client ${key}:`, error);
    }
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    // Run health checks every 10 minutes
    this.healthCheckInterval = setInterval(
      () => {
        // Fire and forget - we don't need to wait for health checks
        Array.from(this.clients.entries()).forEach(([key, client]) => {
          this.performHealthCheck(key, client).catch((error) => {
            console.warn(`Health check failed for ${key}:`, error);
          });
        });
      },
      10 * 60 * 1000
    );
    // Allow process to exit even if interval is running (useful for tests)
    this.healthCheckInterval.unref();
  }

  /**
   * Stop health checks
   */
  private stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }
  }

  /**
   * Setup graceful shutdown handlers
   */
  private setupGracefulShutdown(): void {
    const shutdown = () => {
      console.warn("Shutting down SDK client manager...");
      this.stopHealthChecks();
      // Close any connections if needed
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
    process.on("beforeExit", shutdown);
  }

  /**
   * Get client statistics
   */
  getClientStats(): {
    totalClients: number;
    healthyClients: number;
    unhealthyClients: number;
    healthStatus: Record<string, ClientHealth>;
  } {
    const healthyClients = Array.from(this.healthStatus.values()).filter(
      (health) => health.isHealthy
    ).length;
    const unhealthyClients = this.healthStatus.size - healthyClients;

    return {
      totalClients: this.clients.size,
      healthyClients,
      unhealthyClients,
      healthStatus: Object.fromEntries(this.healthStatus),
    };
  }
}

// Export singleton instance
export const sdkClientManager = SdkClientManager.getInstance();

/**
 * Get comprehensive client statistics and health information
 */
export function getSdkClientStats() {
  const stats = sdkClientManager.getClientStats();
  return {
    ...stats,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    nodeVersion: process.version,
  };
}

/**
 * Initialize client monitoring (call this once at app startup).
 * Logs cached client stats periodically; SdkClientManager already runs health checks.
 */
export function initializeClientMonitoring(): void {
  console.warn("SDK Client monitoring initialized");

  const statsInterval = setInterval(
    () => {
      const stats = getSdkClientStats();
      console.warn("Client Stats:", {
        total: stats.totalClients,
        healthy: stats.healthyClients,
        unhealthy: stats.unhealthyClients,
      });
    },
    5 * 60 * 1000
  );
  // Allow process to exit even if interval is running (useful for tests)
  statsInterval.unref();
}

/**
 * Formats a contact identifier for the Respond.io SDK.
 * Accepts various input formats and converts them to the proper SDK format.
 *
 * @param {string} identifier - The contact identifier in flexible format
 * @returns {ContactIdentifier} - Properly formatted contact identifier
 */
export function formatContactIdentifier(identifier: string): ContactIdentifier {
  // If already in SDK format, return as-is
  if (
    identifier.startsWith("id:") ||
    identifier.startsWith("email:") ||
    identifier.startsWith("phone:")
  ) {
    return identifier as ContactIdentifier;
  }

  // If it's an email address
  if (identifier.includes("@")) {
    return `email:${identifier}` as ContactIdentifier;
  }

  // If it starts with +, it's definitely a phone number
  if (identifier.startsWith("+")) {
    return `phone:${identifier}` as ContactIdentifier;
  }

  // If it's all digits, check length to guess type:
  // - Contact IDs are typically large numbers (6+ digits)
  // - Phone numbers without + are usually 10-15 digits
  // We'll treat shorter numbers (< 6 digits) as contact IDs, longer as phone
  if (/^\d+$/.test(identifier)) {
    // If it's a short number (< 6 digits), likely a contact ID
    // Otherwise, treat as phone number (add + prefix)
    if (identifier.length < 6) {
      return `id:${parseInt(identifier)}` as ContactIdentifier;
    }
    return `phone:+${identifier}` as ContactIdentifier;
  }

  // Default: treat as email (e.g. plain email or unknown format)
  return `email:${identifier}` as ContactIdentifier;
}

/**
 * Creates a new Respond.io SDK client with enhanced error handling and caching.
 *
 * @param {string} apiBaseUrl - The base URL for the API.
 * @param {string} mode - The mode of operation ("http" or "stdio").
 * @param {Ctx} ctx - The context object containing request information.
 * @returns {RespondIO} - A configured Respond.io SDK client.
 * @throws {Error} - Throws an error if the API base URL or token is not set.
 */
export function createSdkClient(apiBaseUrl: string, mode: string, ctx: Ctx): RespondIO {
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

  try {
    const client = sdkClientManager.getClient({
      apiToken: cleanToken,
      baseUrl: apiBaseUrl,
    });
    return client;
  } catch (error) {
    // Mark client as unhealthy if creation fails
    sdkClientManager.markClientUnhealthy({ apiToken: cleanToken, baseUrl: apiBaseUrl });
    throw error;
  }
}

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
 * Handles a successful SDK response by stringifying the data and returning it as a `CallToolResult`.
 *
 * @param {unknown} data - The response data from the SDK.
 * @returns {CallToolResult} - A `CallToolResult` object containing the stringified response data.
 */
export const handleSdkResponse = (data: unknown): CallToolResult => {
  if (typeof data === "undefined") {
    return asCallToolText("No data returned from API.");
  }
  return asCallToolText(safeStringify(data));
};

/**
 * Handles an SDK error by creating a descriptive error message and returning it as a `CallToolResult`.
 *
 * @param {unknown} error - The error object.
 * @returns {CallToolResult} - A `CallToolResult` object containing the error message.
 */
export const handleSdkError = (error: unknown): CallToolResult => {
  let message: string;

  if (error instanceof RespondIOError) {
    const sdkError = error;

    message = `API Error ${sdkError.statusCode}: ${sdkError.message}`;

    if (sdkError.isRateLimitError() && sdkError.rateLimitInfo?.retryAfter) {
      message += ` (Rate limit exceeded. Retry after: ${sdkError.rateLimitInfo.retryAfter} seconds)`;
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
