import { Client } from "@notionhq/client";
import { APIResponseError } from "@notionhq/client";

// Initialize Notion client
const getNotionClient = () => {
  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) {
    throw new Error("NOTION_API_KEY environment variable is required");
  }
  return new Client({ auth: apiKey });
};

/**
 * Helper function to handle API errors
 */
const handleNotionError = (error: unknown): string => {
  if (error instanceof APIResponseError) {
    return `Notion API Error: ${error.code}\nMessage: ${error.message}`;
  } else if (error instanceof Error) {
    return `Error: ${error.message}`;
  }
  return `Unknown error: ${String(error)}`;
};

/**
 * Get a page by ID
 */
export const getPage = async (pageId: string): Promise<string> => {
  try {
    const notion = getNotionClient();
    const response = await notion.pages.retrieve({ page_id: pageId });
    return JSON.stringify(response, null, 2);
  } catch (error) {
    return handleNotionError(error);
  }
};

/**
 * Create a page in a database
 */
export const createPage = async (
  databaseId: string,
  properties: any,
  content?: any[]
): Promise<string> => {
  try {
    const notion = getNotionClient();

    const createParams: any = {
      parent: {
        database_id: databaseId,
      },
      properties: properties,
    };

    // Add content blocks if provided
    if (content && content.length > 0) {
      createParams.children = content;
    }

    const response = await notion.pages.create(createParams);
    return JSON.stringify(response, null, 2);
  } catch (error) {
    return handleNotionError(error);
  }
};

/**
 * Update a page
 */
export const updatePage = async (
  pageId: string,
  properties: any
): Promise<string> => {
  try {
    const notion = getNotionClient();
    const response = await notion.pages.update({
      page_id: pageId,
      properties: properties,
    });
    return JSON.stringify(response, null, 2);
  } catch (error) {
    return handleNotionError(error);
  }
};

/**
 * Get a database by ID
 */
export const getDatabase = async (databaseId: string): Promise<string> => {
  try {
    const notion = getNotionClient();
    const response = await notion.databases.retrieve({
      database_id: databaseId,
    });
    return JSON.stringify(response, null, 2);
  } catch (error) {
    return handleNotionError(error);
  }
};

/**
 * Query a database
 */
export const queryDatabase = async (
  databaseId: string,
  filter?: any,
  sorts?: any[],
  pageSize: number = 100,
  startCursor?: string
): Promise<string> => {
  try {
    const notion = getNotionClient();

    const queryParams: any = {
      database_id: databaseId,
      page_size: pageSize,
    };

    if (filter) {
      queryParams.filter = filter;
    }

    if (sorts) {
      queryParams.sorts = sorts;
    }

    if (startCursor) {
      queryParams.start_cursor = startCursor;
    }

    const response = await notion.databases.query(queryParams);
    return JSON.stringify(response, null, 2);
  } catch (error) {
    return handleNotionError(error);
  }
};

/**
 * Create a database
 */
export const createDatabase = async (
  parentPageId: string,
  title: string,
  properties: any
): Promise<string> => {
  try {
    const notion = getNotionClient();
    const response = await notion.databases.create({
      parent: {
        page_id: parentPageId,
      },
      title: [
        {
          type: "text",
          text: {
            content: title,
          },
        },
      ],
      properties: properties,
    });
    return JSON.stringify(response, null, 2);
  } catch (error) {
    return handleNotionError(error);
  }
};

/**
 * Get a block by ID
 */
export const getBlock = async (blockId: string): Promise<string> => {
  try {
    const notion = getNotionClient();
    const response = await notion.blocks.retrieve({
      block_id: blockId,
    });
    return JSON.stringify(response, null, 2);
  } catch (error) {
    return handleNotionError(error);
  }
};

/**
 * Get block children
 */
export const getBlockChildren = async (
  blockId: string,
  pageSize: number = 100,
  startCursor?: string
): Promise<string> => {
  try {
    const notion = getNotionClient();

    const params: any = {
      block_id: blockId,
      page_size: pageSize,
    };

    if (startCursor) {
      params.start_cursor = startCursor;
    }

    const response = await notion.blocks.children.list(params);
    return JSON.stringify(response, null, 2);
  } catch (error) {
    return handleNotionError(error);
  }
};

/**
 * Append block children
 */
export const appendBlockChildren = async (
  blockId: string,
  children: any[]
): Promise<string> => {
  try {
    const notion = getNotionClient();
    const response = await notion.blocks.children.append({
      block_id: blockId,
      children: children,
    });
    return JSON.stringify(response, null, 2);
  } catch (error) {
    return handleNotionError(error);
  }
};

/**
 * Update a block
 */
export const updateBlock = async (
  blockId: string,
  properties: any
): Promise<string> => {
  try {
    const notion = getNotionClient();
    const response = await notion.blocks.update({
      block_id: blockId,
      ...properties,
    });
    return JSON.stringify(response, null, 2);
  } catch (error) {
    return handleNotionError(error);
  }
};

/**
 * Delete a block
 */
export const deleteBlock = async (blockId: string): Promise<string> => {
  try {
    const notion = getNotionClient();
    const response = await notion.blocks.delete({
      block_id: blockId,
    });
    return JSON.stringify(response, null, 2);
  } catch (error) {
    return handleNotionError(error);
  }
};

/**
 * Get a user by ID
 */
export const getUser = async (userId: string): Promise<string> => {
  try {
    const notion = getNotionClient();
    const response = await notion.users.retrieve({
      user_id: userId,
    });
    return JSON.stringify(response, null, 2);
  } catch (error) {
    return handleNotionError(error);
  }
};

/**
 * List users
 */
export const listUsers = async (
  pageSize: number = 100,
  startCursor?: string
): Promise<string> => {
  try {
    const notion = getNotionClient();

    const params: any = {
      page_size: pageSize,
    };

    if (startCursor) {
      params.start_cursor = startCursor;
    }

    const response = await notion.users.list(params);
    return JSON.stringify(response, null, 2);
  } catch (error) {
    return handleNotionError(error);
  }
};

/**
 * Search Notion
 */
export const search = async (
  query: string,
  sort?: any,
  filter?: any,
  pageSize: number = 100,
  startCursor?: string
): Promise<string> => {
  try {
    const notion = getNotionClient();

    const params: any = {
      query: query,
      page_size: pageSize,
    };

    if (sort) {
      params.sort = sort;
    }

    if (filter) {
      params.filter = filter;
    }

    if (startCursor) {
      params.start_cursor = startCursor;
    }

    const response = await notion.search(params);
    return JSON.stringify(response, null, 2);
  } catch (error) {
    return handleNotionError(error);
  }
};
