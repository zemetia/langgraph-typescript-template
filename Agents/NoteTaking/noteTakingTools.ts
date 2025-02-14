import { tool } from "@langchain/core/tools";
import * as path from "path";
import { WORKING_DIRECTORY } from "../../constant/constant";
import * as fs from "fs/promises";
import { z } from "zod";

export const createOutlineTool = tool(
    async ({ points, file_name }) => {
      const filePath = path.join(WORKING_DIRECTORY, file_name);
      const data = points
        .map((point, index) => `${index + 1}. ${point}\n`)
        .join("");
      await fs.writeFile(filePath, data);
      return `Outline saved to ${file_name}`;
    },
    {
      name: "create_outline",
      description: "Create and save an outline.",
      schema: z.object({
        points: z
          .array(z.string())
          .nonempty("List of main points or sections must not be empty."),
        file_name: z.string(),
      }),
    }
  );