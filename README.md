# Respond.io MCP Server

A Model Context Protocol (MCP) server implementation for the Respond.io API, enabling seamless integration with AI assistants, automation tools, and Claude Desktop.

---

## Features

### Contact Management
- ✅ Get, create, update, and delete contacts
- ✅ Create or update contact (upsert by identifier)
- ✅ Merge two contacts (primary + secondary)
- ✅ List contacts with filters and search
- ✅ Add and remove contact tags
- ✅ Update contact lifecycle stages
- ✅ List contact channels (e.g. WhatsApp, Facebook)

### Messaging
- ✅ Send messages (text, attachments, WhatsApp templates, emails)
- ✅ Retrieve message details and status
- ✅ List messages for a contact (with pagination)
- ✅ Support for multiple channel types

### Conversations
- ✅ Assign/unassign conversations to users
- ✅ Open and close conversations
- ✅ Add closing notes and summaries

### Workspace Management
- ✅ List users and get user by ID
- ✅ List, get, and create custom fields
- ✅ List channels and message templates (e.g. WhatsApp)
- ✅ List closing notes (for closing conversations)
- ✅ Create, update, and delete workspace tags

### Comments
- ✅ Add internal comments to contacts
- ✅ Mention users in comments

### HTTP/STDIO Dual Mode
- ✅ Can run as a local subprocess via stdio or as an HTTP server (`/mcp` endpoint)
- ✅ Health endpoint (`/health`) for monitoring and uptime checks
- ✅ CORS enabled for HTTP mode

---

## Prerequisites

- Node.js 18+
- npm / yarn / bun
- Git

## Installation

```bash
# Clone the repository
git clone https://github.com/respond-io/mcp-server.git
cd mcp-server

# Install dependencies (includes Respond.io SDK)
npm install

# Build the project
npm run build
```

The project depends on `@respond-io/typescript-sdk`. See [SETUP_GUIDE.md](SETUP_GUIDE.md) for full installation and configuration.

---

## Configuration

### Environment Variables

The server is configured using environment variables. Set them in your shell or deployment environment.

- `RESPONDIO_API_KEY`: **(Required)** Your Respond.io API key.
- `RESPONDIO_BASE_URL`: The base URL for the Respond.io API (defaults to `https://api.respond.io/v2`).
- `MCP_SERVER_MODE`: The server mode, either `stdio` or `http` (defaults to `stdio`).
- `PORT`: The port for HTTP mode (defaults to `3000`).

---

## Usage with Claude Desktop

You can use this server with Claude Desktop in either **STDIO** (local subprocess) or **HTTP** (hosted or local HTTP server) mode.

### 1️⃣ STDIO Mode (Recommended for local Claude Desktop)

**Configure Claude Desktop _(For Development Purpose)_:**
```json
{
      "command": "node",
      "args": [
        "/<Your Local Folder Path>/dist/index.js"
      ],
      "env": {
        "RESPONDIO_API_KEY": "your_api_key",
        "MCP_SERVER_MODE": "stdio"
      }
    }
```

**Configure Claude Desktop _(For Production Usage)_:**
```json
{
      "command": "npx",
      "args": [
        "@respond-io/mcp-server"
      ],
      "env": {
        "RESPONDIO_API_KEY": "your_api_key",
        "MCP_SERVER_MODE": "stdio"
      }
    }
```

- Launch Claude Desktop and add this MCP server.
- The server will start as a subprocess and communicate over stdio.

**Test:** Try any MCP tool from Claude Desktop, e.g., get a contact or send a message.

---

### 2️⃣ HTTP Mode (For remote/hosted or local HTTP integration)

**Start the server in HTTP mode:**
```bash
npm run start:http
```
or (if built):
```bash
export MCP_SERVER_MODE=http
node dist/index.js
```

**Configure Claude Desktop:**
```json
{
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "http://localhost:3000/mcp",
        "--header",
        "Authorization:${AUTH_HEADER}"
      ],
      "env": {
        "AUTH_HEADER": "Bearer your-token-here"
      }
    }
```

**Test HTTP health:**
```bash
curl http://localhost:3000/health
# {"status":"ok"}
```

**Test HTTP MCP endpoint:**
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"list_tools","params":{}}'
```
You should get a JSON list of available tools.

---

## Usage Examples

### Contact Management

#### Get a Contact
```typescript
get_contact({ identifier: "id:12345" })
get_contact({ identifier: "email:user@example.com" })
get_contact({ identifier: "phone:+60123456789" })
```

#### Create a Contact
```typescript
create_contact({
  identifier: "phone:+60123456789",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  language: "en",
  custom_fields: [
    { name: "Company", value: "Acme Corp" },
    { name: "Order Number", value: 12345 }
  ]
})
```

#### List Contacts with Filters
```typescript
list_contacts({
  limit: 50,
  search: "john@example.com",
  timezone: "Asia/Kuala_Lumpur"
})
```

#### Add Tags
```typescript
add_contact_tags({
  identifier: "id:12345",
  tags: ["vip", "premium", "sales"]
})
```

#### Create or Update Contact (upsert)
```typescript
create_or_update_contact({
  identifier: "email:user@example.com",
  firstName: "John",
  lastName: "Doe",
  email: "user@example.com"
})
```

#### Merge Contacts
```typescript
merge_contacts({
  primaryContactId: 1,
  secondaryContactId: 2,
  firstName: "Merged Name"
})
```

#### List Contact Channels
```typescript
list_contact_channels({ identifier: "id:12345", limit: 10 })
```

#### Update Contact Lifecycle
```typescript
update_contact_lifecycle({ identifier: "id:12345", stage: "Lead" })
// Clear lifecycle: stage: null
```

### Messaging

#### Send Text Message
```typescript
send_message({
  identifier: "id:12345",
  channelId: null, // Use last interacted channel
  messageType: "text",
  text: "Hello! Thank you for contacting us."
})
```

#### Send WhatsApp Template
```typescript
send_message({
  identifier: "phone:+60123456789",
  channelId: 5678,
  messageType: "whatsapp_template",
  templateName: "order_confirmation",
  templateLanguage: "en"
})
```

#### Send Email
```typescript
send_message({
  identifier: "email:user@example.com",
  channelId: 1234,
  messageType: "email",
  text: "Your order has been shipped!",
  subject: "Order Shipment Notification"
})
```

#### Send Attachment
```typescript
send_message({
  identifier: "id:12345",
  channelId: 5678,
  messageType: "attachment",
  attachmentUrl: "https://example.com/invoice.pdf",
  attachmentType: "file"
})
```

#### Get Message
```typescript
get_message({ identifier: "id:12345", messageId: 987654 })
```

#### List Messages
```typescript
list_messages({
  identifier: "id:12345",
  limit: 20,
  cursorId: undefined  // optional, for pagination
})
```

### Conversations

#### Assign Conversation
```typescript
assign_conversation({
  identifier: "id:12345",
  assignee: "123"
})
assign_conversation({
  identifier: "id:12345",
  assignee: "agent@example.com"
})
assign_conversation({
  identifier: "id:12345",
  assignee: "null"
})
```

#### Close Conversation
```typescript
update_conversation_status({
  identifier: "id:12345",
  status: "close",
  category: "Resolved",
  summary: "Customer issue resolved successfully"
})
```

### Comments

#### Add Comment
```typescript
create_comment({
  identifier: "id:12345",
  text: "Customer requested a callback tomorrow at 2 PM"
})
// Mention a user
create_comment({
  identifier: "id:12345",
  text: "{{@user.456}} please follow up with this customer"
})
```

### Workspace Management

#### List Users
```typescript
list_users({ limit: 20 })
```

#### Get User
```typescript
get_user({ id: 123 })
```

#### List Custom Fields
```typescript
list_custom_fields({ limit: 10 })
```

#### Get Custom Field
```typescript
get_custom_field({ id: 1 })
```

#### Create Custom Field
```typescript
create_custom_field({
  name: "Customer Tier",
  slug: "customer_tier",
  description: "Customer membership tier",
  dataType: "list",
  allowedValues: ["Bronze", "Silver", "Gold", "Platinum"]
})
```

#### List Channels
```typescript
list_channels({ limit: 10 })
```

#### List Closing Notes
```typescript
list_closing_notes({ limit: 10 })
```

#### List Message Templates (e.g. WhatsApp)
```typescript
list_templates({ channelId: 5678, limit: 10 })
```

#### Create Tag
```typescript
create_tag({
  name: "VIP",
  description: "VIP customers",
  colorCode: "#FF5733"
})
```

#### Update Tag
```typescript
update_tag({
  currentName: "VIP",
  name: "Premium",
  colorCode: "#FFD700"
})
```

#### Delete Tag
```typescript
delete_tag({ name: "Old Tag" })
```

---

## Available Tools

The server exposes **28** MCP tools for contacts, messaging, conversations, comments, and workspace management.

**Summary:**

- **Contact (11):** `get_contact`, `create_contact`, `update_contact`, `delete_contact`, `list_contacts`, `add_contact_tags`, `remove_contact_tags`, `create_or_update_contact`, `merge_contacts`, `list_contact_channels`, `update_contact_lifecycle`
- **Messaging (3):** `send_message`, `get_message`, `list_messages`
- **Conversation (2):** `assign_conversation`, `update_conversation_status`
- **Comment (1):** `create_comment`
- **Workspace (11):** `list_users`, `get_user`, `list_custom_fields`, `get_custom_field`, `create_custom_field`, `list_channels`, `list_closing_notes`, `list_templates`, `create_tag`, `update_tag`, `delete_tag`

Tool parameters are defined in the server’s tool schemas (see `src/tools/`). Response shapes, rate limits, and API behavior come from the [Respond.io Developer API](https://docs.respond.io) and the [@respond-io/typescript-sdk](https://www.npmjs.com/package/@respond-io/typescript-sdk) used under the hood.

---

## Development

### Testing

The project uses [Jest](https://jestjs.io/) for tests. Tests run against an in-memory MCP transport and mock the Respond.io API so no real API key is needed for unit tests.

```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

Tests cover:
- **Server & list_tools**: All 28 tools are exposed; each has name, description, and inputSchema; server name/version and capabilities are reported.
- **All 28 tools** (with mocked API): contact, messaging, conversation, comment, and workspace tools.
- **Validation & error scenarios**: Unknown tool name, missing required args, invalid enums, empty arrays where non-empty is required.

### Project Structure

```
mcp-server/
├── src/
│   ├── index.ts          # Main server implementation
│   ├── server.ts         # MCP server factory
│   ├── middlewares/      # Express middlewares
│   ├── protocol/         # STDIO / HTTP protocol handlers
│   ├── utils/            # Utility functions (API client)
│   └── tools/            # Tool definitions
├── dist/                 # Compiled JavaScript output
├── tests/                # Jest tests
├── .env.example          # Environment variable template
├── README.md             # Documentation
└── SETUP_GUIDE.md        # Setup instructions
```

### Development Commands

```bash
# Run in development mode with auto-reload
npm run dev

# Build the project
npm run build

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type check
npm run type-check
```

---

## Code Quality

- ✅ **TypeScript** - Full type safety
- ✅ **ESLint** - Code quality and consistency
- ✅ **Prettier** - Code formatting
- ✅ **Strict Mode** - TypeScript strict mode enabled
- ✅ **Error Handling** - Comprehensive error handling
- ✅ **Modular Design** - Clean separation of concerns

---

## API Rate Limits

The Respond.io API has rate limits. The server handles rate limit errors and includes rate limit information in error responses:

- `Retry-After` - Seconds until retry is allowed
- `X-RateLimit-Limit` - Request limit for the endpoint
- `X-RateLimit-Remaining` - Remaining requests

---

## Error Handling

The server provides detailed error messages:

```typescript
// API errors include status codes and messages
{
  "error": "API Error 404: Contact not found"
}

// Network errors
{
  "error": "Network Error: timeout of 30000ms exceeded"
}

// Validation errors
{
  "error": "API Error 400: Validation error."
}
```

---

## Security Best Practices

1. **Never commit API keys** - Use environment variables
2. **Use HTTPS** - All API calls use secure connections
3. **Validate input** - All inputs are validated before API calls
4. **Error sanitization** - Sensitive information is not exposed in errors

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Ensure all tests pass
- Run linter before committing

---

## Troubleshooting

### "UN_AUTHORIZED" Error
- Check that your API key is correct in `.env`
- Ensure the API key has the necessary permissions

### "Contact not found" Error
- Verify the contact identifier format (`id:123`, `email:user@example.com`, `phone:+60123456789`)
- Check that the contact exists in your workspace

### Rate Limit Errors
- Wait for the time specified in the `Retry-After` header
- Consider implementing exponential backoff for retries

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Delete `node_modules` and `dist` folders, then reinstall

### TypeScript/ESLint Warnings
- Ensure you are using a supported TypeScript version (recommended: `5.3.x`)
- If you see warnings about `any`, use `Record<string, unknown>` or define explicit interfaces

### Health Check Fails
- Ensure the MCP server is running in HTTP mode (`MCP_SERVER_MODE=http`)
- Check the correct port (`PORT`) is open and matches your configuration
- Use `curl http://localhost:3000/health` to test

---

## License

MIT License - see LICENSE file for details

---

## Support

For issues and questions:
- GitHub Issues: [Create an issue]
- Respond.io API Documentation: https://docs.respond.io
- Respond.io Support: https://support.respond.io

---

## Changelog

### Version 1.0.0
- Initial release
- Full support for Contact, Messaging, Conversation, Comment, and Space APIs
- Comprehensive error handling
- TypeScript with strict mode
- MCP SDK integration
- HTTP and STDIO dual-mode support
- Health endpoint for monitoring

---

## Acknowledgments

- Built with [Model Context Protocol SDK](https://github.com/anthropics/modelcontextprotocol)
- Powered by [Respond.io API](https://respond.io)

---

Made with ❤️ for seamless customer engagement automation