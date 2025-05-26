import { z, ZodRawShape } from "zod";

// Schema for retrieving a page
export const NotionGetPageSchema: ZodRawShape = {
  page_id: z.string().describe("The ID of the page to retrieve"),
};

// Schema for creating a page
export const NotionCreatePageSchema: ZodRawShape = {
  database_id: z
    .string()
    .describe("The ID of the database to create the page in"),
  properties: z
    .record(z.any())
    .describe("The properties of the page to create (JSON object)"),
  content: z
    .array(z.any())
    .optional()
    .describe("Optional content blocks to add to the page"),
};

// Schema for updating a page
export const NotionUpdatePageSchema: ZodRawShape = {
  page_id: z.string().describe("The ID of the page to update"),
  properties: z
    .record(z.any())
    .describe("The properties to update (JSON object)"),
};

// Schema for retrieving a database
export const NotionGetDatabaseSchema: ZodRawShape = {
  database_id: z.string().describe("The ID of the database to retrieve"),
};

// Schema for querying a database
export const NotionQueryDatabaseSchema: ZodRawShape = {
  database_id: z.string().describe("The ID of the database to query"),
  filter: z
    .record(z.any())
    .optional()
    .describe("Optional filter to apply to the query (JSON object)"),
  sorts: z
    .array(z.any())
    .optional()
    .describe("Optional sorts to apply to the query (JSON array)"),
  page_size: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(100)
    .describe("Number of results per page (1-100, default 100)"),
  start_cursor: z
    .string()
    .optional()
    .describe("Cursor for pagination (optional)"),
};

// Schema for creating a database
export const NotionCreateDatabaseSchema: ZodRawShape = {
  parent_page_id: z.string().describe("The ID of the parent page"),
  title: z.string().describe("The title of the database"),
  properties: z
    .record(z.any())
    .describe("The properties of the database (JSON object)"),
};

// Schema for retrieving a block
export const NotionGetBlockSchema: ZodRawShape = {
  block_id: z.string().describe("The ID of the block to retrieve"),
};

// Schema for retrieving block children
export const NotionGetBlockChildrenSchema: ZodRawShape = {
  block_id: z.string().describe("The ID of the block to get children for"),
  page_size: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(100)
    .describe("Number of results per page (1-100, default 100)"),
  start_cursor: z
    .string()
    .optional()
    .describe("Cursor for pagination (optional)"),
};

// Schema for appending block children
export const NotionAppendBlockChildrenSchema: ZodRawShape = {
  block_id: z.string().describe("The ID of the block to append children to"),
  children: z
    .array(z.any())
    .describe("The children blocks to append (JSON array)"),
};

// Schema for updating a block
export const NotionUpdateBlockSchema: ZodRawShape = {
  block_id: z.string().describe("The ID of the block to update"),
  properties: z
    .record(z.any())
    .describe("The properties to update (JSON object)"),
};

// Schema for deleting a block
export const NotionDeleteBlockSchema: ZodRawShape = {
  block_id: z.string().describe("The ID of the block to delete"),
};

// Schema for retrieving a user
export const NotionGetUserSchema: ZodRawShape = {
  user_id: z.string().describe("The ID of the user to retrieve"),
};

// Schema for listing users
export const NotionListUsersSchema: ZodRawShape = {
  page_size: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(100)
    .describe("Number of results per page (1-100, default 100)"),
  start_cursor: z
    .string()
    .optional()
    .describe("Cursor for pagination (optional)"),
};

// Schema for searching
export const NotionSearchSchema: ZodRawShape = {
  query: z.string().describe("The search query"),
  sort: z
    .record(z.any())
    .optional()
    .describe("Optional sort to apply to the search results (JSON object)"),
  filter: z
    .record(z.any())
    .optional()
    .describe("Optional filter to apply to the search results (JSON object)"),
  page_size: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(100)
    .describe("Number of results per page (1-100, default 100)"),
  start_cursor: z
    .string()
    .optional()
    .describe("Cursor for pagination (optional)"),
};
