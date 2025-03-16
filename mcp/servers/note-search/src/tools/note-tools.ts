import TurndownService from "turndown";
import { JSDOM } from "jsdom";

// Type definitions for Note API responses
interface NoteContent {
  key: string;
  likeCount: number;
  [key: string]: any;
}

interface NoteListResponse {
  data: {
    contents: NoteContent[];
    isLastPage: boolean;
    totalCount: number;
  };
}

// Initialize Turndown for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

// Configure Turndown rules for Note.com specific HTML
turndownService.addRule("figures", {
  filter: "figure",
  replacement: function (content: string, node: Node) {
    // Cast node to Element to use querySelector
    const element = node as Element;
    const img = element.querySelector("img");
    const figcaption = element.querySelector("figcaption");

    if (img) {
      const alt = img.getAttribute("alt") || "";
      const src = img.getAttribute("src") || "";
      let markdown = `![${alt}](${src})`;

      if (figcaption && figcaption.textContent) {
        markdown += `\n*${figcaption.textContent.trim()}*`;
      }

      return `\n\n${markdown}\n\n`;
    }

    return content;
  },
});

// Add rule for handling Note.com's paragraph styles
turndownService.addRule("paragraphs", {
  filter: "p",
  replacement: function (content: string) {
    return `\n\n${content}\n\n`;
  },
});

// Add rule for handling Note.com's headings
turndownService.addRule("headings", {
  filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
  replacement: function (content: string, node: Node) {
    const level = Number(node.nodeName.charAt(1));
    const hashes = "#".repeat(level);
    return `\n\n${hashes} ${content}\n\n`;
  },
});

// Add rule for handling Note.com's links
turndownService.addRule("links", {
  filter: "a",
  replacement: function (content: string, node: Node) {
    const element = node as Element;
    const href = element.getAttribute("href") || "";
    return `[${content}](${href})`;
  },
});

/**
 * Fetch article from Note.com and convert to Markdown
 * @param notekey Note article key
 * @returns Article content in Markdown format
 */
export const fetchNoteArticle = async (notekey: string): Promise<string> => {
  try {
    // Validate notekey format (basic validation)
    if (!notekey.match(/^[a-zA-Z0-9]+$/)) {
      return `Error: Invalid notekey format. Expected alphanumeric characters.`;
    }

    // Fetch article from Note.com API
    const response = await fetch(`https://note.com/api/v3/notes/${notekey}`);

    if (!response.ok) {
      if (response.status === 404) {
        return `Error: Article with key "${notekey}" not found.`;
      }
      return `Error fetching article: HTTP ${response.status} - ${response.statusText}`;
    }

    const data = await response.json();

    // Extract title and body from response
    const title = data.data?.name;
    const body = data.data?.body;

    if (!title || !body) {
      return `Error: Could not extract title or body from the article.`;
    }

    // Create a DOM to handle the HTML content
    const dom = new JSDOM(body);
    const document = dom.window.document;

    // Process embedded content (tweets, Instagram posts, etc.)
    processEmbeddedContent(document);

    // Convert HTML to Markdown
    const markdownBody = turndownService.turndown(body);

    // Format the final output
    const markdown = `# ${title}\n\n${markdownBody}`;

    return markdown;
  } catch (error) {
    if (error instanceof Error) {
      return `Error processing article: ${error.message}`;
    }
    return `Unknown error occurred while processing the article`;
  }
};

/**
 * Sleep for the specified number of milliseconds
 * @param ms Milliseconds to sleep
 * @returns Promise that resolves after the specified time
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Fetch top 10 notes by likeCount from a creator
 * @param creator Note creator username
 * @returns Top 10 notes by likeCount in Markdown format
 */
export const fetchNotesByCreator = async (creator: string): Promise<string> => {
  try {
    // Validate creator format (basic validation)
    if (!creator.match(/^[a-zA-Z0-9_-]+$/)) {
      return `Error: Invalid creator format. Expected alphanumeric characters, underscores, or hyphens.`;
    }

    // Array to store all notes
    const allNotes: NoteContent[] = [];
    let currentPage = 1;
    let isLastPage = false;

    // Fetch all pages of notes
    while (!isLastPage) {
      // Fetch notes from Note.com API
      const response = await fetch(
        `https://note.com/api/v2/creators/${creator}/contents?kind=note&page=${currentPage}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          return `Error: Creator "${creator}" not found.`;
        }
        return `Error fetching notes: HTTP ${response.status} - ${response.statusText}`;
      }

      const data = (await response.json()) as NoteListResponse;

      if (!data.data?.contents || !Array.isArray(data.data.contents)) {
        return `Error: Could not extract note contents from the response.`;
      }

      // Add notes from this page to our collection
      allNotes.push(...data.data.contents);

      // Check if this is the last page
      isLastPage = data.data.isLastPage;

      // Add a 1-second delay before fetching the next page to reduce load on the server
      if (!isLastPage) {
        await sleep(1000);
      }

      // Move to next page
      currentPage++;

      // Safety check to prevent infinite loops
      if (currentPage > 10) {
        break;
      }
    }

    // Sort notes by likeCount (descending)
    const sortedNotes = allNotes.sort((a, b) => {
      const likeCountA =
        typeof a.likeCount === "number"
          ? a.likeCount
          : typeof a.likeCount === "string"
          ? parseInt(a.likeCount, 10)
          : 0;
      const likeCountB =
        typeof b.likeCount === "number"
          ? b.likeCount
          : typeof b.likeCount === "string"
          ? parseInt(b.likeCount, 10)
          : 0;
      return likeCountB - likeCountA;
    });

    // Take top 10 notes
    const topNotes = sortedNotes.slice(0, 10);

    // Format the notes as a summary
    let markdown = `# Top 10 Most Liked Notes by ${creator}\n\n`;

    // Fetch full content for each note
    for (let i = 0; i < topNotes.length; i++) {
      const note = topNotes[i];
      const likeCount =
        typeof note.likeCount === "number"
          ? note.likeCount
          : typeof note.likeCount === "string"
          ? parseInt(note.likeCount, 10)
          : 0;

      markdown += `# ${note.name || "Untitled"}\n\n`;
      markdown += `- Likes: ${likeCount}\n`;
      markdown += `- Note key: \`${note.key}\`\n`;
      markdown += `- URL: https://note.com/${creator}/n/${note.key}\n`;

      // Add publish date if available
      if (note.publishAt) {
        markdown += `- Published: ${note.publishAt}\n`;
      }

      markdown += "\n";

      // Fetch and add the full content of the article
      try {
        console.error(
          `Fetching content for note ${i + 1}/${topNotes.length}: ${note.key}`
        );
        const articleContent = await fetchNoteArticle(note.key);

        // Check if the content is an error message
        if (articleContent.startsWith("Error:")) {
          markdown += `*Content could not be fetched: ${articleContent}*\n\n`;
        } else {
          // Extract just the content part (skip the title as we already have it)
          const contentWithoutTitle = articleContent
            .split("\n")
            .slice(2)
            .join("\n");
          markdown += `## Content\n\n${contentWithoutTitle}\n\n`;
        }
      } catch (error) {
        markdown += `*Content could not be fetched due to an error*\n\n`;
        console.error(`Error fetching content for ${note.key}:`, error);
      }

      // Add separator between notes (except after the last one)
      if (i < topNotes.length - 1) {
        markdown += "---\n\n";
        // Add a delay before fetching the next article to reduce load on the server
        await sleep(1000);
      }
    }

    return markdown;
  } catch (error) {
    if (error instanceof Error) {
      return `Error processing notes: ${error.message}`;
    }
    return `Unknown error occurred while processing the notes`;
  }
};

/**
 * Process embedded content in Note.com articles
 * @param document DOM document
 */
function processEmbeddedContent(document: Document): void {
  // Process Twitter embeds
  const twitterEmbeds = document.querySelectorAll(
    '[embedded-service="twitter"]'
  );
  twitterEmbeds.forEach((embed) => {
    const tweetUrl = embed.getAttribute("data-src");
    if (tweetUrl) {
      // Replace with a simple link to the tweet
      const placeholder = document.createElement("p");
      placeholder.textContent = `Tweet: ${tweetUrl}`;
      embed.replaceWith(placeholder);
    }
  });

  // Process Instagram embeds
  const instagramEmbeds = document.querySelectorAll(
    '[embedded-service="instagram"]'
  );
  instagramEmbeds.forEach((embed) => {
    const instagramUrl = embed.getAttribute("data-src");
    if (instagramUrl) {
      // Replace with a simple link to the Instagram post
      const placeholder = document.createElement("p");
      placeholder.textContent = `Instagram post: ${instagramUrl}`;
      embed.replaceWith(placeholder);
    }
  });

  // Process other embedded content as needed
}
