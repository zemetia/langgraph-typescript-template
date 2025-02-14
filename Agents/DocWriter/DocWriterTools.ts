import * as fs from "fs/promises";
import * as path from "path";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { WORKING_DIRECTORY } from "../../constant/constant";

await fs.mkdir(WORKING_DIRECTORY, { recursive: true });

export const readDocumentTool = tool(
    async ({ file_name, start, end }) => {
      const filePath = path.join(WORKING_DIRECTORY, file_name);
      const data = await fs.readFile(filePath, "utf-8");
      const lines = data.split("\n");
      return lines.slice(start ?? 0, end).join("\n");
    },
    {
      name: "read_document",
      description: "Read the specified document.",
      schema: z.object({
        file_name: z.string(),
        start: z.number().optional(),
        end: z.number().optional(),
      }),
    }
  );
  
  export const writeDocumentTool = tool(
    async ({ content, file_name }) => {
      const filePath = path.join(WORKING_DIRECTORY, file_name);
      await fs.writeFile(filePath, content);
      return `Document saved to ${file_name}`;
    },
    {
      name: "write_document",
      description: "Create and save a text document.",
      schema: z.object({
        content: z.string(),
        file_name: z.string(),
      }),
    }
  );
  
  export const editDocumentTool = tool(
    async ({ file_name, inserts }) => {
      const filePath = path.join(WORKING_DIRECTORY, file_name);
      const data = await fs.readFile(filePath, "utf-8");
      let lines = data.split("\n");
  
      const sortedInserts = Object.entries(inserts).sort(
        ([a], [b]) => parseInt(a) - parseInt(b),
      );
  
      for (const [line_number_str, text] of sortedInserts) {
        const line_number = parseInt(line_number_str);
        if (1 <= line_number && line_number <= lines.length + 1) {
          lines.splice(line_number - 1, 0, text);
        } else {
          return `Error: Line number ${line_number} is out of range.`;
        }
      }
  
      await fs.writeFile(filePath, lines.join("\n"));
      return `Document edited and saved to ${file_name}`;
    },
    {
      name: "edit_document",
      description: "Edit a document by inserting text at specific line numbers.",
      schema: z.object({
        file_name: z.string(),
        inserts: z.record(z.number(), z.string()),
      }),
    }
  );