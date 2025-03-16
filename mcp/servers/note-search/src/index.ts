import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { NoteCreatorArticlesSchema } from "./tools/schemas.js";
import { fetchNotesByCreator } from "./tools/note-tools.js";

const server = new McpServer({
  name: "maron/note-search",
  version: "0.0.1",
});

// Register note article tool
// server.tool(
//   "note_article",
//   "Fetch a Note.com article and convert to Markdown",
//   NoteArticleSchema,
//   async ({ notekey }) => {
//     const result = await fetchNoteArticle(notekey);
//     return {
//       content: [
//         {
//           type: "text",
//           text: result,
//         },
//       ],
//     };
//   }
// );

// Register note creator articles tool
server.tool(
  "note_creator_articles",
  "Fetch the top 10 most liked notes by a Note.com creator",
  NoteCreatorArticlesSchema,
  async ({ creator }) => {
    const result = await fetchNotesByCreator(creator);
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
  console.error("Note Search MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
