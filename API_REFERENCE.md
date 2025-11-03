# Respond.io MCP Server API Reference

Complete reference for all available tools in the Respond.io MCP Server.

## Table of Contents

- [Contact Tools](#contact-tools)
- [Messaging Tools](#messaging-tools)
- [Conversation Tools](#conversation-tools)
- [Comment Tools](#comment-tools)
- [Workspace Tools](#workspace-tools)
- [Common Parameters](#common-parameters)
- [Error Handling](#error-handling)

---

## Contact Tools

### get_contact

Retrieves information about a specific contact.

**Parameters:**
- `identifier` (string, required): Contact identifier
  - Format: `id:123`, `email:user@example.com`, or `phone:+60123456789`

**Returns:**
```json
{
  "id": 12345,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+60123456789",
  "status": "open",
  "tags": ["vip", "premium"],
  "assignee": {
    "id": 456,
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com"
  },
  "lifecycle": "Hot Lead",
  "created_at": 1663274081
}
```

**Example:**
```typescript
get_contact({ identifier: "email:john@example.com" })
```

---

### create_contact

Creates a new contact in the workspace.

**Parameters:**
- `identifier` (string, required): Contact identifier (email or phone, not ID)
- `firstName` (string, required): First name
- `lastName` (string, optional): Last name
- `email` (string, optional): Email address
- `phone` (string, optional): Phone number in E.164 format
- `language` (string, optional): Language code (ISO 639-1)
- `profilePic` (string, optional): URL of the contact's profile picture
- `custom_fields` (array, optional): Array of custom field objects

**Returns:**
```json
{
  "code": "200",
  "message": "Contact added successfully!"
}
```

**Example:**
```typescript
create_contact({
  identifier: "phone:+60123456789",
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  language: "en",
  custom_fields: [
    { name: "Company", value: "Acme Corp" }
  ]
})
```

---

### update_contact

Updates an existing contact's information.

**Parameters:**
- `identifier` (string, required): Contact identifier
- `firstName` (string, optional): First name
- `lastName` (string, optional): Last name
- `email` (string, optional): Email address
- `phone` (string, optional): Phone number
- `language` (string, optional): Language code
- `custom_fields` (array, optional): Custom fields to update

**Returns:**
```json
{
  "contactId": 12345
}
```

**Example:**
```typescript
update_contact({
  identifier: "id:12345",
  firstName: "John",
  lastName: "Smith",
  custom_fields: [
    { name: "Status", value: "Active" }
  ]
})
```

---

### delete_contact

Deletes a contact from the workspace.

**Parameters:**
- `identifier` (string, required): Contact identifier

**Returns:**
```json
{
  "contactId": 12345
}
```

**Example:**
```typescript
delete_contact({ identifier: "id:12345" })
```

---

### list_contacts

Lists contacts with optional filtering and search.

**Parameters:**
- `limit` (number, optional): Number of contacts to return (1-100, default: 10)
- `cursorId` (number, optional): Cursor ID for pagination
- `search` (string, optional): Search query
- `timezone` (string, optional): Timezone (default: "UTC")

**Returns:**
```json
{
  "items": [
    {
      "id": 12345,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    }
  ],
  "pagination": {
    "next": "https://api.respond.io/contact/list?limit=10&cursorId=10",
    "previous": "https://api.respond.io/contact/list?limit=10&cursorId=-10"
  }
}
```

**Example:**
```typescript
list_contacts({
  limit: 50,
  search: "john",
  timezone: "Asia/Kuala_Lumpur"
})
```

---

### add_contact_tags

Adds tags to a contact.

**Parameters:**
- `identifier` (string, required): Contact identifier
- `tags` (string, required): Comma-separated list of tag names (1-10 tags, max 255 chars each)

**Returns:**
```json
{
  "contactId": 12345
}
```

**Example:**
```typescript
add_contact_tags({
  identifier: "id:12345",
  tags: ["vip", "premium", "enterprise"]
})
```

---

### remove_contact_tags

Removes tags from a contact.

**Parameters:**
- `identifier` (string, required): Contact identifier
- `tags` (string, required): Comma-separated list of tag names to remove

**Returns:**
```json
{
  "contactId": 12345
}
```

**Example:**
```typescript
remove_contact_tags({
  identifier: "id:12345",
  tags: ["old_tag"]
})
```

---

## Messaging Tools

### send_message

Sends a message to a contact through a specific channel.

**Parameters:**
- `identifier` (string, required): Contact identifier
- `channelId` (number, optional): Channel ID (null for last interacted channel)
- `messageType` (string, required): Type of message
  - Values: `text`, `attachment`, `whatsapp_template`, `email`, `quick_reply`
- **For text messages:**
  - `text` (string, required): Message text
- **For email messages:**
  - `text` (string, required): Email body
  - `subject` (string, required): Email subject
- **For attachments:**
  - `attachmentUrl` (string, required): URL of the attachment
  - `attachmentType` (string, required): `image`, `video`, `audio`, or `file`
- **For WhatsApp templates:**
  - `templateName` (string, required): Template name
  - `templateLanguage` (string, required): Language code

**Returns:**
```json
{
  "messageId": 1262965213
}
```

**Examples:**

**Text Message:**
```typescript
send_message({
  identifier: "id:12345",
  channelId: null,
  messageType: "text",
  text: "Hello! How can we help you today?"
})
```

**Email:**
```typescript
send_message({
  identifier: "email:user@example.com",
  channelId: 5678,
  messageType: "email",
  text: "Your order has been shipped!",
  subject: "Order Shipment Notification"
})
```

**Attachment:**
```typescript
send_message({
  identifier: "id:12345",
  channelId: 5678,
  messageType: "attachment",
  attachmentUrl: "https://example.com/invoice.pdf",
  attachmentType: "file"
})
```

**WhatsApp Template:**
```typescript
send_message({
  identifier: "phone:+60123456789",
  channelId: 5678,
  messageType: "whatsapp_template",
  templateName: "order_confirmation",
  templateLanguage: "en"
})
```

---

### get_message

Retrieves a message by its ID.

**Parameters:**
- `identifier` (string, required): Contact identifier
- `messageId` (number, required): Message ID

**Returns:**
```json
{
  "messageId": 1262965213,
  "channelMessageId": "123",
  "contactId": 12345,
  "channelId": 5678,
  "traffic": "outgoing",
  "message": {
    "type": "text",
    "text": "Hello!"
  },
  "status": [
    {
      "value": "delivered",
      "timestamp": 1662965213
    }
  ]
}
```

**Example:**
```typescript
get_message({
  identifier: "id:12345",
  messageId: 1262965213
})
```

---

## Conversation Tools

### assign_conversation

Assigns or unassigns a conversation to a user.

**Parameters:**
- `identifier` (string, required): Contact identifier
- `assignee` (string, required): User ID, email, or "null" to unassign

**Returns:**
```json
{
  "contactId": 12345
}
```

**Examples:**

**Assign by User ID:**
```typescript
assign_conversation({
  identifier: "id:12345",
  assignee: "456"
})
```

**Assign by Email:**
```typescript
assign_conversation({
  identifier: "id:12345",
  assignee: "agent@example.com"
})
```

**Unassign:**
```typescript
assign_conversation({
  identifier: "id:12345",
  assignee: "null"
})
```

---

### update_conversation_status

Opens or closes a conversation.

**Parameters:**
- `identifier` (string, required): Contact identifier
- `status` (string, required): `open` or `close`
- `category` (string, optional): Closing note category (max 128 chars)
- `summary` (string, optional): Conversation summary (max 512 chars)

**Returns:**
```json
{
  "contactId": 12345
}
```

**Examples:**

**Open Conversation:**
```typescript
update_conversation_status({
  identifier: "id:12345",
  status: "open"
})
```

**Close with Notes:**
```typescript
update_conversation_status({
  identifier: "id:12345",
  status: "close",
  category: "Issue Resolved",
  summary: "Customer's shipping issue was resolved successfully"
})
```

---

## Comment Tools

### create_comment

Adds an internal comment to a contact.

**Parameters:**
- `identifier` (string, required): Contact identifier
- `text` (string, required): Comment text (max 1000 chars)
  - Can mention users: `{{@user.ID}}`
  - Can use variables: `{{$contact.name}}`

**Returns:**
```json
{
  "contactId": 12345,
  "text": "This is a comment",
  "created_at": 1662979868
}
```

**Examples:**

**Simple Comment:**
```typescript
create_comment({
  identifier: "id:12345",
  text: "Customer requested callback tomorrow at 2 PM"
})
```

**Mention User:**
```typescript
create_comment({
  identifier: "id:12345",
  text: "{{@user.456}} please follow up with this customer"
})
```

---

## Workspace Tools

### list_users

Lists users in the workspace.

**Parameters:**
- `limit` (number, optional): Number of users (1-100, default: 10)
- `cursorId` (number, optional): Cursor ID for pagination

**Returns:**
```json
{
  "items": [
    {
      "id": 123,
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "role": "agent",
      "team": {
        "id": 456,
        "name": "Support Team"
      }
    }
  ],
  "pagination": {
    "next": "...",
    "previous": "..."
  }
}
```

**Example:**
```typescript
list_users({ limit: 20 })
```

---

### get_user

Retrieves information about a specific user.

**Parameters:**
- `userId` (string, required): User ID

**Returns:**
```json
{
  "id": 123,
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "role": "manager"
}
```

**Example:**
```typescript
get_user({ userId: "123" })
```

---

### list_custom_fields

Lists all custom fields in the workspace.

**Parameters:**
- `limit` (number, optional): Number of fields (1-100, default: 10)
- `cursorId` (number, optional): Cursor ID for pagination

**Returns:**
```json
{
  "items": [
    {
      "id": 789,
      "name": "Customer Tier",
      "description": "Membership level",
      "dataType": "list",
      "allowedValues": ["Bronze", "Silver", "Gold"]
    }
  ]
}
```

**Example:**
```typescript
list_custom_fields({ limit: 50 })
```

---

### create_custom_field

Creates a new custom field.

**Parameters:**
- `name` (string, required): Field name (max 50 chars)
- `slug` (string, optional): Unique identifier (letters, numbers, underscores)
- `description` (string, optional): Description (max 255 chars)
- `dataType` (string, required): Data type
  - Values: `text`, `list`, `checkbox`, `email`, `number`, `url`, `date`, `time`, `textArea`
- `allowedValues` (array, optional): Required for `list` type

**Returns:**
```json
{
  "id": 789,
  "name": "Customer Tier",
  "dataType": "list"
}
```

**Examples:**

**Text Field:**
```typescript
create_custom_field({
  name: "Notes",
  description: "Internal notes about customer",
  dataType: "text"
})
```

**List Field:**
```typescript
create_custom_field({
  name: "Priority",
  slug: "customer_priority",
  description: "Customer priority level",
  dataType: "list",
  allowedValues: ["Low", "Medium", "High", "Critical"]
})
```

---

### list_channels

Lists all messaging channels in the workspace.

**Parameters:**
- `limit` (number, optional): Number of channels (1-100, default: 10)
- `cursorId` (number, optional): Cursor ID for pagination

**Returns:**
```json
{
  "items": [
    {
      "id": 5678,
      "name": "WhatsApp Business",
      "source": "whatsapp_cloud",
      "created_at": 1663274081
    }
  ]
}
```

**Example:**
```typescript
list_channels({ limit: 20 })
```

---

### list_closing_notes

Lists all closing note categories.

**Parameters:**
- `limit` (number, optional): Number of notes (1-100, default: 10)
- `cursorId` (number, optional): Cursor ID for pagination

**Returns:**
```json
{
  "items": [
    {
      "category": "Issue Resolved",
      "description": "Customer issue was successfully resolved"
    }
  ]
}
```

**Example:**
```typescript
list_closing_notes({ limit: 50 })
```

---

## Common Parameters

### Identifier Format

Contact identifiers must follow one of these formats:

- **By ID**: `id:12345`
- **By Email**: `email:user@example.com`
- **By Phone**: `phone:+60123456789` (E.164 format)

### Pagination

Most list endpoints support pagination:

- `limit`: Number of items (1-100, default: 10)
- `cursorId`: Pointer to next batch of records

---

## Error Handling

### Error Response Format

```json
{
  "code": 400,
  "message": "Validation error."
}
```

### Common Error Codes

- **400**: Validation error - Check request parameters
- **401**: Unauthorized - Invalid or missing API key
- **404**: Not found - Resource doesn't exist
- **429**: Rate limit exceeded - Wait before retrying
- **449**: Request queued - Retry in a few minutes
- **500**: Server error - Contact support if persistent

### Rate Limiting

Rate limit information is included in response headers:

- `Retry-After`: Seconds until retry allowed
- `X-RateLimit-Limit`: Request limit for endpoint
- `X-RateLimit-Remaining`: Remaining requests

**Best Practices:**
- Implement exponential backoff for retries
- Monitor rate limit headers
- Cache responses when appropriate
- Batch operations when possible

---

## Data Formats

### Phone Numbers
Must be in E.164 format: `+[country code][number]`
- Example: `+60123456789`

### Email Addresses
Standard email format: `user@domain.com`

### Language Codes
ISO 639-1 format (2 letters): `en`, `ms`, `zh`

### Country Codes
ISO 3166-1 alpha-2 format (2 letters): `MY`, `US`, `SG`

### Dates
Format: `YYYY-MM-DD`
- Example: `2024-12-31`

### Times
Format: `HH:MM` (24-hour)
- Example: `14:30`

### Timestamps
Unix timestamp in seconds
- Example: `1663274081`

---

## Best Practices

1. **Always validate input** before making API calls
2. **Handle errors gracefully** with proper error messages
3. **Use pagination** for large datasets
4. **Cache responses** when appropriate
5. **Monitor rate limits** and implement backoff strategies
6. **Use meaningful identifiers** for better tracking
7. **Add descriptive comments** when closing conversations
8. **Tag contacts systematically** for better organization

---

For more information, see the [README.md](README.md) and [SETUP_GUIDE.md](SETUP_GUIDE.md).