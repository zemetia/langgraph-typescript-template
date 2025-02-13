import { z } from "zod";
import { ChatCohere } from "@langchain/cohere";

import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

import { AIMessageChunk } from "@langchain/core/messages";
import { systemPrompt, workerPrompt } from "./supervisorPrompts";
import { END } from "@langchain/langgraph";

export const members = ["researcher", "chart_generator"] as const;

export const supervisorLlm = async () => {
    
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
        ["human", workerPrompt],
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
    .pipe((x: AIMessageChunk) => (x?.tool_calls[0].args));

}