# Notion MCP Server

This MCP server provides tools for interacting with the Notion API, allowing you to manage pages, databases, blocks, users, and more.

## Installation

```bash
npm install
```

## Configuration

You need to set up your Notion API key as an environment variable. Add the following to your MCP settings file:

```json
{
  "mcpServers": {
    "notion": {
      "command": "node",
      "args": ["/path/to/notion/build/index.js"],
      "env": {
        "NOTION_API_KEY": "your-notion-api-key"
      }
    }
  }
}
```

### Getting a Notion API Key

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click "Create new integration"
3. Give your integration a name and select the workspace you want to connect to
4. Click "Submit"
5. Copy the "Internal Integration Token" - this is your API key

Remember to share the pages/databases you want to access with your integration. To do this:
1. Open the page/database in Notion
2. Click the "..." menu in the top right
3. Click "Add connections"
4. Select your integration

## Available Tools

### Pages

- **notion_get_page**: Retrieve a Notion page by ID
- **notion_create_page**: Create a new page in a Notion database
- **notion_update_page**: Update a Notion page

### Databases

- **notion_get_database**: Retrieve a Notion database by ID
- **notion_query_database**: Query a Notion database
- **notion_create_database**: Create a new database in a Notion page

### Blocks

- **notion_get_block**: Retrieve a Notion block by ID
- **notion_get_block_children**: Retrieve children of a Notion block
- **notion_append_block_children**: Append children to a Notion block
- **notion_update_block**: Update a Notion block
- **notion_delete_block**: Delete (archive) a Notion block

### Users

- **notion_get_user**: Retrieve a Notion user by ID
- **notion_list_users**: List all users in a Notion workspace

### Search

- **notion_search**: Search Notion workspace

## Usage Examples

### Retrieving a Page

```javascript
const result = await use_mcp_tool({
  server_name: "notion",
  tool_name: "notion_get_page",
  arguments: {
    page_id: "page_id_here"
  }
});
```

### Creating a Page in a Database

```javascript
const result = await use_mcp_tool({
  server_name: "notion",
  tool_name: "notion_create_page",
  arguments: {
    database_id: "database_id_here",
    properties: {
      "Name": {
        "title": [
          {
            "text": {
              "content": "New Page Title"
            }
          }
        ]
      },
      "Tags": {
        "multi_select": [
          {
            "name": "Tag 1"
          },
          {
            "name": "Tag 2"
          }
        ]
      }
    }
  }
});
```

### Querying a Database

```javascript
const result = await use_mcp_tool({
  server_name: "notion",
  tool_name: "notion_query_database",
  arguments: {
    database_id: "database_id_here",
    filter: {
      "property": "Status",
      "select": {
        "equals": "Done"
      }
    },
    sorts: [
      {
        "property": "Due Date",
        "direction": "ascending"
      }
    ]
  }
});
```

### Appending Block Children

```javascript
const result = await use_mcp_tool({
  server_name: "notion",
  tool_name: "notion_append_block_children",
  arguments: {
    block_id: "block_id_here",
    children: [
      {
        "type": "paragraph",
        "paragraph": {
          "rich_text": [
            {
              "type": "text",
              "text": {
                "content": "Hello, world!"
              }
            }
          ]
        }
      }
    ]
  }
});
```

### Searching Notion

```javascript
const result = await use_mcp_tool({
  server_name: "notion",
  tool_name: "notion_search",
  arguments: {
    query: "search term"
  }
});
```

## Building

```bash
npm run build
```

## References

- [Notion API Documentation](https://developers.notion.com/docs)
- [Notion JavaScript SDK](https://github.com/makenotion/notion-sdk-js)
