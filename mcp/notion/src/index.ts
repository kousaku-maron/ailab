import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  NotionGetPageSchema,
  NotionCreatePageSchema,
  NotionUpdatePageSchema,
  NotionGetDatabaseSchema,
  NotionQueryDatabaseSchema,
  NotionCreateDatabaseSchema,
  NotionGetBlockSchema,
  NotionGetBlockChildrenSchema,
  NotionAppendBlockChildrenSchema,
  NotionUpdateBlockSchema,
  NotionDeleteBlockSchema,
  NotionGetUserSchema,
  NotionListUsersSchema,
  NotionSearchSchema,
} from "./tools/schemas.js";
import {
  getPage,
  createPage,
  updatePage,
  getDatabase,
  queryDatabase,
  createDatabase,
  getBlock,
  getBlockChildren,
  appendBlockChildren,
  updateBlock,
  deleteBlock,
  getUser,
  listUsers,
  search,
} from "./tools/notion-tools.js";

const server = new McpServer({
  name: "maron/notion",
  version: "0.0.1",
});

// Register notion_get_page tool
server.tool(
  "notion_get_page",
  "Retrieve a Notion page by ID",
  NotionGetPageSchema,
  async ({ page_id }) => {
    const result = await getPage(page_id);
    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }
);

// Register notion_create_page tool
server.tool(
  "notion_create_page",
  "Create a new page in a Notion database",
  NotionCreatePageSchema,
  async ({ database_id, properties, content }) => {
    const result = await createPage(database_id, properties, content);
    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }
);

// Register notion_update_page tool
server.tool(
  "notion_update_page",
  "Update a Notion page",
  NotionUpdatePageSchema,
  async ({ page_id, properties }) => {
    const result = await updatePage(page_id, properties);
    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }
);

// Register notion_get_database tool
server.tool(
  "notion_get_database",
  "Retrieve a Notion database by ID",
  NotionGetDatabaseSchema,
  async ({ database_id }) => {
    const result = await getDatabase(database_id);
    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }
);

// Register notion_query_database tool
server.tool(
  "notion_query_database",
  "Query a Notion database",
  NotionQueryDatabaseSchema,
  async ({ database_id, filter, sorts, page_size, start_cursor }) => {
    const result = await queryDatabase(
      database_id,
      filter,
      sorts,
      page_size,
      start_cursor
    );
    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }
);

// Register notion_create_database tool
server.tool(
  "notion_create_database",
  "Create a new database in a Notion page",
  NotionCreateDatabaseSchema,
  async ({ parent_page_id, title, properties }) => {
    const result = await createDatabase(parent_page_id, title, properties);
    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }
);

// Register notion_get_block tool
server.tool(
  "notion_get_block",
  "Retrieve a Notion block by ID",
  NotionGetBlockSchema,
  async ({ block_id }) => {
    const result = await getBlock(block_id);
    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }
);

// Register notion_get_block_children tool
server.tool(
  "notion_get_block_children",
  "Retrieve children of a Notion block",
  NotionGetBlockChildrenSchema,
  async ({ block_id, page_size, start_cursor }) => {
    const result = await getBlockChildren(block_id, page_size, start_cursor);
    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }
);

// Register notion_append_block_children tool
server.tool(
  "notion_append_block_children",
  "Append children to a Notion block",
  NotionAppendBlockChildrenSchema,
  async ({ block_id, children }) => {
    const result = await appendBlockChildren(block_id, children);
    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }
);

// Register notion_update_block tool
server.tool(
  "notion_update_block",
  "Update a Notion block",
  NotionUpdateBlockSchema,
  async ({ block_id, properties }) => {
    const result = await updateBlock(block_id, properties);
    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }
);

// Register notion_delete_block tool
server.tool(
  "notion_delete_block",
  "Delete (archive) a Notion block",
  NotionDeleteBlockSchema,
  async ({ block_id }) => {
    const result = await deleteBlock(block_id);
    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }
);

// Register notion_get_user tool
server.tool(
  "notion_get_user",
  "Retrieve a Notion user by ID",
  NotionGetUserSchema,
  async ({ user_id }) => {
    const result = await getUser(user_id);
    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }
);

// Register notion_list_users tool
server.tool(
  "notion_list_users",
  "List all users in a Notion workspace",
  NotionListUsersSchema,
  async ({ page_size, start_cursor }) => {
    const result = await listUsers(page_size, start_cursor);
    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }
);

// Register notion_search tool
server.tool(
  "notion_search",
  "Search Notion workspace",
  NotionSearchSchema,
  async ({ query, sort, filter, page_size, start_cursor }) => {
    const result = await search(query, sort, filter, page_size, start_cursor);
    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Notion MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
