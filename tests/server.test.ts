import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createServer } from "../src/server.js";

const EXPECTED_TOOL_NAMES = [
  "get_contact",
  "create_contact",
  "update_contact",
  "delete_contact",
  "list_contacts",
  "add_contact_tags",
  "remove_contact_tags",
  "create_or_update_contact",
  "merge_contacts",
  "list_contact_channels",
  "update_contact_lifecycle",
  "send_message",
  "get_message",
  "list_messages",
  "assign_conversation",
  "update_conversation_status",
  "create_comment",
  "list_users",
  "get_user",
  "list_custom_fields",
  "get_custom_field",
  "create_custom_field",
  "list_channels",
  "list_closing_notes",
  "list_templates",
  "create_tag",
  "update_tag",
  "delete_tag",
];

describe("MCP Server", () => {
  let server: McpServer;
  let client: Client;

  beforeAll(async () => {
    const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();

    const { server: s } = createServer({
      apiBaseUrl: "https://api.respond.io/v2",
      debug: false,
      mode: "stdio",
    });
    server = s;
    await server.connect(serverSide);

    client = new Client({ name: "test-client", version: "1.0.0" }, { capabilities: {} });
    await client.connect(clientSide);
  });

  afterAll(async () => {
    await client.close();
    await server.close();
  });

  describe("list_tools", () => {
    it("returns all expected tools", async () => {
      const { tools } = await client.listTools();

      expect(tools).toBeDefined();
      expect(Array.isArray(tools)).toBe(true);

      const names = tools.map((t) => t.name).sort();
      for (const expected of EXPECTED_TOOL_NAMES) {
        expect(names).toContain(expected);
      }
      expect(tools.length).toBe(EXPECTED_TOOL_NAMES.length);
    });

    it("each tool has name and description", async () => {
      const { tools } = await client.listTools();

      for (const tool of tools) {
        expect(tool.name).toBeDefined();
        expect(typeof tool.name).toBe("string");
        expect(tool.name.length).toBeGreaterThan(0);
        expect(tool.description).toBeDefined();
        expect(typeof tool.description).toBe("string");
      }
    });

    it("each tool has inputSchema when it accepts arguments", async () => {
      const { tools } = await client.listTools();

      for (const tool of tools) {
        expect(tool).toHaveProperty("inputSchema");
        if (tool.inputSchema && typeof tool.inputSchema === "object") {
          expect(tool.inputSchema).toHaveProperty("type", "object");
        }
      }
    });
  });

  describe("server info", () => {
    it("reports server name and version after connect", () => {
      const info = client.getServerVersion();
      expect(info).toBeDefined();
      expect(info?.name).toBe("Respond.io MCP Server");
      expect(info?.version).toBeDefined();
    });

    it("reports server capabilities after connect", () => {
      const caps = client.getServerCapabilities();
      expect(caps).toBeDefined();
    });
  });
});
