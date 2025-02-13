import { z } from "zod";
import { ChatCohere } from "@langchain/cohere";

import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { systemPrompt } from "../Prompts/prompt";
import { AIMessageChunk } from "@langchain/core/messages";

const supervisorLlm = async () => {
    const members = ["researcher", "chart_generator"] as const;

    const options = [END, ...members];

    const routingTool = {
        name: "route",
        description: "Select the next role.",
        schema: z.object({
          next: z.enum([END, ...members]),
        }),
    }

    const prompt = ChatPromptTemplate.fromMessages([
        ["system", systemPrompt],
        new MessagesPlaceholder("messages"),
        [
          "human",
          "Given the conversation above, who should act next?" +
          " Or should we FINISH? Select one of: {options}",
        ],
    ]);

    const formattedPrompt = await prompt.partial({
        options: options.join(", "),
        members: members.join(", "),
    });

    const llm = new ChatCohere({
        model: "command-r",
        temperature: 0,
    });

    return formattedPrompt
    .pipe(llm.bindTools(
      [routingTool],
      {
        tool_choice: "route",
      },
    ))
    // select the first one
    .pipe((x: AIMessageChunk|undefined) => (x?.tool_calls?[0].args?? ""));

}