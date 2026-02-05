import { describe, it, expect, beforeAll, afterAll, jest } from "@jest/globals";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mockApiModule } from "./helpers/mockApi.js";

jest.unstable_mockModule("../src/utils/api.js", () => mockApiModule());

const { createServer } = await import("../src/server.js");

describe("MCP Server - call_tool (all tools with mocked API)", () => {
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

  const expectToolSuccess = (result: unknown) => {
    expect(result).toBeDefined();
    const r = result as { content?: Array<{ type?: string; text?: string }> };
    expect(r.content).toBeDefined();
    expect(Array.isArray(r.content)).toBe(true);
    expect(r.content!.length).toBeGreaterThan(0);
    expect(r.content![0]).toHaveProperty("type", "text");
    expect(r.content![0]).toHaveProperty("text");
  };

  describe("Contact tools", () => {
    it("get_contact returns content", async () => {
      const result = await client.callTool({
        name: "get_contact",
        arguments: { identifier: "id:12345" },
      });
      expectToolSuccess(result);
    });

    it("create_contact returns content", async () => {
      const result = await client.callTool({
        name: "create_contact",
        arguments: {
          identifier: "email:user@example.com",
          firstName: "John",
          lastName: "Doe",
        },
      });
      expectToolSuccess(result);
    });

    it("update_contact returns content", async () => {
      const result = await client.callTool({
        name: "update_contact",
        arguments: { identifier: "id:12345", firstName: "Jane" },
      });
      expectToolSuccess(result);
    });

    it("delete_contact returns content", async () => {
      const result = await client.callTool({
        name: "delete_contact",
        arguments: { identifier: "id:12345" },
      });
      expectToolSuccess(result);
    });

    it("list_contacts returns content", async () => {
      const result = await client.callTool({
        name: "list_contacts",
        arguments: { limit: 10, timezone: "UTC" },
      });
      expectToolSuccess(result);
    });

    it("add_contact_tags returns content", async () => {
      const result = await client.callTool({
        name: "add_contact_tags",
        arguments: { identifier: "id:12345", tags: ["vip", "sales"] },
      });
      expectToolSuccess(result);
    });

    it("remove_contact_tags returns content", async () => {
      const result = await client.callTool({
        name: "remove_contact_tags",
        arguments: { identifier: "id:12345", tags: ["vip"] },
      });
      expectToolSuccess(result);
    });

    it("create_or_update_contact returns content", async () => {
      const result = await client.callTool({
        name: "create_or_update_contact",
        arguments: {
          identifier: "email:user@example.com",
          firstName: "John",
          lastName: "Doe",
        },
      });
      expectToolSuccess(result);
    });

    it("merge_contacts returns content", async () => {
      const result = await client.callTool({
        name: "merge_contacts",
        arguments: { primaryContactId: 1, secondaryContactId: 2 },
      });
      expectToolSuccess(result);
    });

    it("merge_contacts with optional fields returns content", async () => {
      const result = await client.callTool({
        name: "merge_contacts",
        arguments: {
          primaryContactId: 1,
          secondaryContactId: 2,
          firstName: "Merged",
          email: "merged@example.com",
        },
      });
      expectToolSuccess(result);
    });

    it("list_contact_channels returns content", async () => {
      const result = await client.callTool({
        name: "list_contact_channels",
        arguments: { identifier: "id:12345", limit: 10 },
      });
      expectToolSuccess(result);
    });

    it("update_contact_lifecycle returns content", async () => {
      const result = await client.callTool({
        name: "update_contact_lifecycle",
        arguments: { identifier: "id:12345", stage: "Lead" },
      });
      expectToolSuccess(result);
    });

    it("update_contact_lifecycle (clear) returns content", async () => {
      const result = await client.callTool({
        name: "update_contact_lifecycle",
        arguments: { identifier: "id:12345", stage: null },
      });
      expectToolSuccess(result);
    });
  });

  describe("Messaging tools", () => {
    it("send_message (text) returns content", async () => {
      const result = await client.callTool({
        name: "send_message",
        arguments: {
          identifier: "id:12345",
          messageType: "text",
          text: "Hello",
        },
      });
      expectToolSuccess(result);
    });

    it("send_message (email) returns content", async () => {
      const result = await client.callTool({
        name: "send_message",
        arguments: {
          identifier: "email:user@example.com",
          channelId: 1,
          messageType: "email",
          text: "Body",
          subject: "Subject",
        },
      });
      expectToolSuccess(result);
    });

    it("get_message returns content", async () => {
      const result = await client.callTool({
        name: "get_message",
        arguments: { identifier: "id:12345", messageId: 1 },
      });
      expectToolSuccess(result);
    });

    it("list_messages returns content", async () => {
      const result = await client.callTool({
        name: "list_messages",
        arguments: { identifier: "id:12345", limit: 20 },
      });
      expectToolSuccess(result);
    });

    it("send_message (attachment) returns content", async () => {
      const result = await client.callTool({
        name: "send_message",
        arguments: {
          identifier: "id:12345",
          messageType: "attachment",
          attachmentUrl: "https://example.com/image.png",
          attachmentType: "image",
        },
      });
      expectToolSuccess(result);
    });

    it("send_message (whatsapp_template) returns content", async () => {
      const result = await client.callTool({
        name: "send_message",
        arguments: {
          identifier: "id:12345",
          channelId: 1,
          messageType: "whatsapp_template",
          templateName: "hello_world",
          templateLanguage: "en",
        },
      });
      expectToolSuccess(result);
    });
  });

  describe("Conversation tools", () => {
    it("assign_conversation returns content", async () => {
      const result = await client.callTool({
        name: "assign_conversation",
        arguments: { identifier: "id:12345", assignee: "user@example.com" },
      });
      expectToolSuccess(result);
    });

    it("assign_conversation (unassign) returns content", async () => {
      const result = await client.callTool({
        name: "assign_conversation",
        arguments: { identifier: "id:12345", assignee: null },
      });
      expectToolSuccess(result);
    });

    it("update_conversation_status (close) returns content", async () => {
      const result = await client.callTool({
        name: "update_conversation_status",
        arguments: {
          identifier: "id:12345",
          status: "close",
          category: "Resolved",
          summary: "Done",
        },
      });
      expectToolSuccess(result);
    });

    it("update_conversation_status (open) returns content", async () => {
      const result = await client.callTool({
        name: "update_conversation_status",
        arguments: { identifier: "id:12345", status: "open" },
      });
      expectToolSuccess(result);
    });
  });

  describe("Comment tools", () => {
    it("create_comment returns content", async () => {
      const result = await client.callTool({
        name: "create_comment",
        arguments: {
          identifier: "id:12345",
          text: "Internal note",
        },
      });
      expectToolSuccess(result);
    });
  });

  describe("Workspace tools", () => {
    it("list_users returns content", async () => {
      const result = await client.callTool({
        name: "list_users",
        arguments: { limit: 10 },
      });
      expectToolSuccess(result);
    });

    it("list_custom_fields returns content", async () => {
      const result = await client.callTool({
        name: "list_custom_fields",
        arguments: { limit: 10 },
      });
      expectToolSuccess(result);
    });

    it("create_custom_field returns content", async () => {
      const result = await client.callTool({
        name: "create_custom_field",
        arguments: {
          name: "Tier",
          dataType: "list",
          allowedValues: ["Bronze", "Silver", "Gold"],
        },
      });
      expectToolSuccess(result);
    });

    it("list_channels returns content", async () => {
      const result = await client.callTool({
        name: "list_channels",
        arguments: { limit: 10 },
      });
      expectToolSuccess(result);
    });

    it("get_user returns content", async () => {
      const result = await client.callTool({
        name: "get_user",
        arguments: { id: 1 },
      });
      expectToolSuccess(result);
    });

    it("get_custom_field returns content", async () => {
      const result = await client.callTool({
        name: "get_custom_field",
        arguments: { id: 1 },
      });
      expectToolSuccess(result);
    });

    it("list_closing_notes returns content", async () => {
      const result = await client.callTool({
        name: "list_closing_notes",
        arguments: { limit: 10 },
      });
      expectToolSuccess(result);
    });

    it("list_templates returns content", async () => {
      const result = await client.callTool({
        name: "list_templates",
        arguments: { channelId: 100, limit: 10 },
      });
      expectToolSuccess(result);
    });

    it("create_tag returns content", async () => {
      const result = await client.callTool({
        name: "create_tag",
        arguments: { name: "VIP", description: "VIP customers", colorCode: "#FF5733" },
      });
      expectToolSuccess(result);
    });

    it("update_tag returns content", async () => {
      const result = await client.callTool({
        name: "update_tag",
        arguments: { currentName: "VIP", name: "Premium", colorCode: "#FFD700" },
      });
      expectToolSuccess(result);
    });

    it("delete_tag returns content", async () => {
      const result = await client.callTool({
        name: "delete_tag",
        arguments: { name: "Old Tag" },
      });
      expectToolSuccess(result);
    });
  });
});

describe("MCP Server - validation and error scenarios", () => {
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

  it("call_tool with unknown tool name returns error result", async () => {
    const result = await client.callTool({
      name: "unknown_tool_xyz",
      arguments: {},
    });
    expect(result.isError).toBe(true);
    expect(result.content).toBeDefined();
    expect(JSON.stringify(result.content)).toContain("not found");
  });

  it("list_messages with missing required identifier returns validation error", async () => {
    const result = await client.callTool({
      name: "list_messages",
      arguments: { limit: 10 },
    });
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toContain("identifier");
    expect(JSON.stringify(result.content)).toMatch(/Required|validation/i);
  });

  it("get_contact with empty identifier returns result (server may accept or error)", async () => {
    const result = await client.callTool({
      name: "get_contact",
      arguments: { identifier: "" },
    });
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(Array.isArray(result.content)).toBe(true);
  });

  it("add_contact_tags with empty tags array returns validation error", async () => {
    const result = await client.callTool({
      name: "add_contact_tags",
      arguments: { identifier: "id:123", tags: [] },
    });
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toContain("tags");
    expect(JSON.stringify(result.content)).toMatch(/validation|element/i);
  });

  it("update_conversation_status with invalid status returns validation error", async () => {
    const result = await client.callTool({
      name: "update_conversation_status",
      arguments: { identifier: "id:123", status: "invalid" },
    });
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toContain("status");
    expect(JSON.stringify(result.content)).toMatch(/open|close|enum/i);
  });

  it("send_message with invalid messageType returns validation error", async () => {
    const result = await client.callTool({
      name: "send_message",
      arguments: {
        identifier: "id:123",
        messageType: "invalid_type",
        text: "Hi",
      },
    });
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toContain("messageType");
    expect(JSON.stringify(result.content)).toMatch(/validation|enum/i);
  });

  it("create_contact with missing firstName returns validation error", async () => {
    const result = await client.callTool({
      name: "create_contact",
      arguments: { identifier: "email:u@example.com", lastName: "Doe" },
    });
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toMatch(/firstName|required|validation/i);
  });

  it("create_or_update_contact with missing firstName returns validation error", async () => {
    const result = await client.callTool({
      name: "create_or_update_contact",
      arguments: { identifier: "id:123", lastName: "Doe" },
    });
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toMatch(/firstName|required|validation/i);
  });

  it("create_custom_field with invalid dataType returns validation error", async () => {
    const result = await client.callTool({
      name: "create_custom_field",
      arguments: {
        name: "Field",
        dataType: "invalid",
      },
    });
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toContain("dataType");
    expect(JSON.stringify(result.content)).toMatch(/validation|enum/i);
  });

  it("merge_contacts with missing primaryContactId returns validation error", async () => {
    const result = await client.callTool({
      name: "merge_contacts",
      arguments: { secondaryContactId: 2 },
    });
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toMatch(/primaryContactId|required|validation/i);
  });

  it("list_contact_channels with missing identifier returns validation error", async () => {
    const result = await client.callTool({
      name: "list_contact_channels",
      arguments: { limit: 10 },
    });
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toContain("identifier");
  });

  it("get_custom_field with missing id returns validation error", async () => {
    const result = await client.callTool({
      name: "get_custom_field",
      arguments: {},
    });
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toMatch(/id|required|validation/i);
  });

  it("get_user with missing id returns validation error", async () => {
    const result = await client.callTool({
      name: "get_user",
      arguments: {},
    });
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toMatch(/id|required|validation/i);
  });

  it("list_templates with missing channelId returns validation error", async () => {
    const result = await client.callTool({
      name: "list_templates",
      arguments: { limit: 10 },
    });
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toMatch(/channelId|required|validation/i);
  });

  it("create_tag with missing name returns validation error", async () => {
    const result = await client.callTool({
      name: "create_tag",
      arguments: { description: "A tag" },
    });
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toMatch(/name|required|validation/i);
  });

  it("update_tag with missing currentName returns validation error", async () => {
    const result = await client.callTool({
      name: "update_tag",
      arguments: { name: "New Name" },
    });
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toMatch(/currentName|required|validation/i);
  });

  it("delete_tag with missing name returns validation error", async () => {
    const result = await client.callTool({
      name: "delete_tag",
      arguments: {},
    });
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).toMatch(/name|required|validation/i);
  });
});
