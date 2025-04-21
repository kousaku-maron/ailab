import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  BraveWebSearchSchema,
  BraveLocalSearchSchema,
  WebPageAnalysisSchema,
} from "./tools/schemas.js";
import {
  performWebSearch,
  performLocalSearch,
  analyzeWebPage,
} from "./tools/web-search-tools.js";

const server = new McpServer({
  name: "maron/web-search",
  version: "0.1.0",
});

// Register web search tool
server.tool(
  "brave_web_search",
  "Performs a web search using the Brave Search API, ideal for general queries, news, articles, and online content. Use this for broad information gathering, recent events, or when you need diverse web sources. Supports pagination, content filtering, and freshness controls. Maximum 20 results per request, with offset for pagination.",
  BraveWebSearchSchema,
  async ({ query, count = 10, offset = 0 }) => {
    const result = await performWebSearch(query, count, offset);
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

// Register local search tool
server.tool(
  "brave_local_search",
  "Searches for local businesses and places using Brave's Local Search API. Best for queries related to physical locations, businesses, restaurants, services, etc. Returns detailed information including business names and addresses, ratings and review counts, phone numbers and opening hours. Use this when the query implies 'near me' or mentions specific locations.",
  BraveLocalSearchSchema,
  async ({ query, count = 5 }) => {
    const result = await performLocalSearch(query, count);
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

// Register web page analysis tool
server.tool(
  "analyze_webpage",
  "Analyzes a specific webpage using Firecrawl, extracting the main content and converting it to a clean, readable format. Ideal for detailed analysis of articles, blog posts, or any web content.",
  WebPageAnalysisSchema,
  async ({ url }) => {
    const result = await analyzeWebPage(url);
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
  console.error("Web Search MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
