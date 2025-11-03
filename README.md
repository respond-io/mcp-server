# Respond.io MCP Server

A Model Context Protocol (MCP) server implementation for the Respond.io API, enabling seamless integration with AI assistants, automation tools, and Claude Desktop.

---

## Features

### Contact Management
- ✅ Get, create, update, and delete contacts
- ✅ List contacts with filters and search
- ✅ Add and remove contact tags
- ✅ Update contact lifecycle stages
- ✅ List contact channels

### Messaging
- ✅ Send messages (text, attachments, WhatsApp templates, emails)
- ✅ Retrieve message details and status
- ✅ Support for multiple channel types

### Conversations
- ✅ Assign/unassign conversations to users
- ✅ Open and close conversations
- ✅ Add closing notes and summaries

### Workspace Management
- ✅ List users and get user details
- ✅ Manage custom fields
- ✅ List channels and closing notes
- ✅ Create and manage workspace tags

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
git clone <repository-url>
cd mcp-server

# Install dependencies
npm install

# Build the project
npm run build
```

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

**Test:**  
Try any MCP tool from Claude Desktop, e.g., get a contact or send a message.

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
list_users({
  limit: 20
})
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
list_channels({
  limit: 10
})
```

---

## Available Tools

### Contact Tools
- `get_contact` - Retrieve contact information
- `create_contact` - Create a new contact
- `update_contact` - Update contact information
- `delete_contact` - Delete a contact
- `list_contacts` - List all contacts with filters
- `add_contact_tags` - Add tags to a contact
- `remove_contact_tags` - Remove tags from a contact

### Messaging Tools
- `send_message` - Send messages (text, attachment, template, email)
- `get_message` - Retrieve message details

### Conversation Tools
- `assign_conversation` - Assign/unassign conversations
- `update_conversation_status` - Open/close conversations

### Comment Tools
- `create_comment` - Add internal comments

### Workspace Tools
- `list_users` - List workspace users
- `get_user` - Get user details
- `list_custom_fields` - List custom fields
- `create_custom_field` - Create custom fields
- `list_channels` - List messaging channels
- `list_closing_notes` - List closing note categories

---

## Development

### Project Structure
```
mcp-server/
├── src/
│   ├── index.ts          # Main server implementation
│   ├── middlewares/      # Express middlewares
│   ├── utils/            # Utility functions
│   └── tools/            # Tool definitions
├── dist/                 # Compiled JavaScript output
├── .env.example          # Environment variable template
├── .eslintrc.json        # ESLint configuration
├── .prettierrc.json      # Prettier configuration
├── tsconfig.json         # TypeScript configuration
├── package.json          # Project dependencies
└── README.md             # Documentation
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