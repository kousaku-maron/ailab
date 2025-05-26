import axios from "axios";
import FirecrawlApp from "@mendable/firecrawl-js";

const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

if (!BRAVE_API_KEY) {
  throw new Error("BRAVE_API_KEY environment variable is required");
}

if (!FIRECRAWL_API_KEY) {
  throw new Error("FIRECRAWL_API_KEY environment variable is required");
}

const braveApi = axios.create({
  baseURL: "https://api.search.brave.com/res/v1",
  headers: {
    Accept: "application/json",
    "X-Subscription-Token": BRAVE_API_KEY,
  },
});

const firecrawl = new FirecrawlApp({
  apiKey: FIRECRAWL_API_KEY,
});

interface BraveSearchResult {
  title: string;
  url: string;
  description: string;
}

export async function performWebSearch(
  query: string,
  count: number = 10,
  offset: number = 0
): Promise<string> {
  try {
    const response = await braveApi.get("/web/search", {
      params: {
        q: query,
        count: Math.min(count, 20),
        offset,
      },
    });

    const results = response.data.web.results
      .map((result: BraveSearchResult, index: number) => {
        const position = offset + index + 1;
        return `${position}. **[${result.title}](${result.url})**\n${result.description}\n---\n`;
      })
      .join("\n");

    return results || "No results found.";
  } catch (error) {
    console.error("Brave search error:", error);
    throw error;
  }
}

export async function performLocalSearch(
  query: string,
  count: number = 5
): Promise<string> {
  try {
    const response = await braveApi.get("/places/search/local", {
      params: {
        q: query,
        count: Math.min(count, 20),
      },
    });

    const results = response.data.places
      .map((place: any, index: number) => {
        const rating = place.rating
          ? `⭐ ${place.rating}/5 (${place.reviews} reviews)`
          : "";
        const address = place.address ? `📍 ${place.address}` : "";
        const phone = place.phone ? `📞 ${place.phone}` : "";
        const hours = place.hours ? `🕒 ${place.hours}` : "";

        return `${index + 1}. **${
          place.name
        }**\n${address}\n${phone}\n${rating}\n${hours}\n---\n`;
      })
      .join("\n");

    return results || "No local results found.";
  } catch (error) {
    console.error("Brave local search error:", error);
    throw error;
  }
}

// Firecrawlを使用した特定URLの詳細解析
export async function analyzeWebPage(url: string): Promise<string> {
  try {
    const scrapeResponse = await firecrawl.scrapeUrl(url, {
      formats: ["markdown"],
      onlyMainContent: true,
    });

    if (!scrapeResponse.success) {
      throw new Error("Page analysis failed: " + scrapeResponse.error);
    }

    return scrapeResponse.markdown || "No content could be extracted.";
  } catch (error) {
    console.error("Firecrawl analysis error:", error);
    throw error;
  }
}
