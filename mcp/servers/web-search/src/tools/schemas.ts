import { z, ZodRawShape } from "zod";

export const BraveWebSearchSchema: ZodRawShape = {
  query: z.string().describe("Search query (max 400 chars, 50 words)"),
  count: z.number().optional().describe("Number of results (1-20, default 10)"),
  offset: z
    .number()
    .optional()
    .describe("Pagination offset (max 9, default 0)"),
};

export const BraveLocalSearchSchema: ZodRawShape = {
  query: z
    .string()
    .describe("Local search query (e.g. 'pizza near Central Park')"),
  count: z.number().optional().describe("Number of results (1-20, default 5)"),
};

export const WebPageAnalysisSchema: ZodRawShape = {
  url: z.string().url().describe("URL of the webpage to analyze"),
};
