import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const scrapeWebpage = tool(async (input) => {
    const loader = new CheerioWebBaseLoader(input.url);
    const docs = await loader.load();
    const formattedDocs = docs.map(
      (doc) =>
        `<Document name="${doc.metadata?.title}">\n${doc.pageContent}\n</Document>`,
    );
    return formattedDocs.join("\n\n");
  },
  {
    name: "scrape_webpage",
    description: "Scrape the contents of a webpage.",
    schema: z.object({
      url: z.string(),
    }),
  }
)

export {scrapeWebpage}