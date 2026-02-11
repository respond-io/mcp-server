# Respond.io MCP Server Setup Guide

This guide will walk you through setting up the Respond.io MCP Server for use with Claude Desktop or other MCP clients.

## Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager
- A Respond.io account with API access
- Respond.io API key

## Step 1: Get Your Respond.io API Key

1. Log in to your Respond.io account
2. Navigate to **Settings** → **API Keys**
3. Click **Generate New API Key**
4. Copy the API key (you won't be able to see it again)
5. Store it securely

## Step 2: Install the Server

### Option A: From Source

```bash
# Clone the repository
git clone https://github.com/respond-io/mcp-server.git
cd mcp-server

# Install dependencies
npm install

# Build the project
npm run build
```

### Option B: From npm (when published)

```bash
npm install -g @respond-io/mcp-server
```

## Step 3: Configure Environment Variables

The server is configured through environment variables. The most important one is `RESPONDIO_API_KEY`.

### For local development:

You can set the environment variables in your shell profile (e.g., `~/.bashrc`, `~/.zshrc`) or export them in your terminal session:

```bash
export RESPONDIO_API_KEY="your_api_key_here"
export RESPONDIO_BASE_URL="https://api.respond.io/v2"
export LOG_LEVEL="info"
```

### For Docker:

You can pass the environment variables to the `docker run` command:

```bash
docker run -p 3000:3000 \
  -e RESPONDIO_API_KEY="your_api_key_here" \
  -e RESPONDIO_BASE_URL="https://api.respond.io/v2" \
  respondio-mcp-server
```

Or you can use a `.env` file with `docker-compose`.

## Step 4: Test the Server

Test that the server is working correctly:

```bash
# Run the server
npm start

# Or in development mode
npm run dev
```

The server should start without errors and display:
```
Respond.io MCP Server running on stdio
```

## Step 5: Configure Claude Desktop

### macOS

Edit or create the Claude Desktop configuration file:

```bash
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### Windows

Edit or create the configuration file at:

```
%APPDATA%\Claude\claude_desktop_config.json
```

### Linux

Edit or create the configuration file at:

```
~/.config/Claude/claude_desktop_config.json
```

### Configuration Content

Add the following configuration:

```json
{
  "mcpServers": {
    "respondio": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"]
    }
  }
}
```

**Important:** Replace `/absolute/path/to/mcp-server` with the actual path to your installation.

#### For npm global installation:

```json
{
  "mcpServers": {
    "respondio": {
      "command": "npx",
      "args": ["@respond-io/mcp-server"],
      "env": {
        "RESPONDIO_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Step 6: Restart Claude Desktop

1. Completely quit Claude Desktop
2. Relaunch Claude Desktop
3. The Respond.io MCP Server should now be available

## Step 7: Verify Integration

In Claude Desktop, try using one of the tools:

```
Can you list the users in my Respond.io workspace?
```

Claude should be able to call the `list_users` tool and return your workspace users.

## Common Issues and Solutions

### Issue: "UN_AUTHORIZED" Error

**Solution:**
- Verify your API key is correct
- Check that the API key hasn't expired
- Ensure you have the necessary permissions

### Issue: Server Not Starting

**Solution:**
- Check that Node.js version is 18.0.0 or higher: `node --version`
- Verify all dependencies are installed: `npm install`
- Check for build errors: `npm run build`
- Review logs for specific error messages

### Issue: Claude Can't Find the Server

**Solution:**
- Verify the path in `claude_desktop_config.json` is absolute and correct
- On Windows, use double backslashes: `C:\\Users\\...\\dist\\index.js`
- Ensure the server binary has execute permissions (Linux/macOS): `chmod +x dist/index.js`
- Restart Claude Desktop completely

### Issue: Tools Not Appearing

**Solution:**
- Check Claude Desktop's MCP status in settings
- Review the Claude Desktop logs:
  - macOS: `~/Library/Logs/Claude/`
  - Windows: `%APPDATA%\Claude\Logs\`
  - Linux: `~/.config/Claude/logs/`

### Issue: Rate Limit Errors

**Solution:**
- Wait for the time specified in the error message
- Reduce the frequency of API calls
- Contact Respond.io support to increase your rate limits

## Advanced Configuration

### Custom Base URL

If you're using a different Respond.io instance:

```json
{
  "mcpServers": {
    "respondio": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "RESPONDIO_API_KEY": "your_api_key_here",
        "RESPONDIO_BASE_URL": "https://custom-api.respond.io/v2"
      }
    }
  }
}
```

### Debug Logging

Enable debug logging for troubleshooting:

```json
{
  "mcpServers": {
    "respondio": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "RESPONDIO_API_KEY": "your_api_key_here",
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

### Multiple Workspaces

To use multiple Respond.io workspaces:

```json
{
  "mcpServers": {
    "respondio-workspace1": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "RESPONDIO_API_KEY": "workspace1_api_key"
      }
    },
    "respondio-workspace2": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "RESPONDIO_API_KEY": "workspace2_api_key"
      }
    }
  }
}
```

## Security Best Practices

### 1. Protect Your API Key

- Never commit API keys to version control
- Use environment variables or secure secret management
- Rotate API keys regularly
- Use different keys for development and production

### 2. File Permissions

Restrict access to configuration files:

```bash
# macOS/Linux
chmod 600 ~/.config/Claude/claude_desktop_config.json
```

### 3. Network Security

- Ensure all API calls use HTTPS (default)
- Monitor API usage for unusual activity
- Set up IP allowlisting in Respond.io if available

## Updating the Server

To update to the latest version:

```bash
# Navigate to the server directory
cd mcp-server

# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Rebuild
npm run build

# Restart Claude Desktop
```

## Uninstalling

To remove the server:

1. Remove the configuration from `claude_desktop_config.json`
2. Restart Claude Desktop
3. Delete the server directory:

```bash
rm -rf /path/to/mcp-server
```

For global installation:

```bash
npm uninstall -g @respond-io/mcp-server
```

## Getting Help

If you encounter issues:

1. Check the logs in Claude Desktop's log directory
2. Enable debug logging for more detailed information
3. Review the [troubleshooting section](#common-issues-and-solutions)
4. Open an issue on GitHub with:
   - Your Node.js version
   - Operating system
   - Error messages from logs
   - Steps to reproduce

## Next Steps

Once setup is complete:

1. Review the [README.md](README.md) for usage examples
2. Explore available tools with Claude
3. Check the [README](README.md) for tool list and examples, and [Respond.io Developer API](https://docs.respond.io) for API details
4. Read best practices for using the MCP server

---

**Need more help?** Visit our [GitHub Issues](https://github.com/respond-io/mcp-server/issues)