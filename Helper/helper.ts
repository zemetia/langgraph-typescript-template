import { BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { WORKING_DIRECTORY } from "../constant/constant";
import * as fs from "fs/promises";
import { Runnable, RunnableLambda } from "@langchain/core/runnables";
import { StructuredToolInterface } from "@langchain/core/tools";
import { MessagesAnnotation } from "@langchain/langgraph";
import { ChatCohere } from "@langchain/cohere";
import { z } from "zod";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { JsonOutputToolsParser } from "@langchain/core/output_parsers/openai_tools";

const prelude = new RunnableLambda({
    func: async (state: {
      messages: BaseMessage[];
      next: string;
      instructions: string;
    }) => {
      let writtenFiles: string[] = [];
      if (
        !(await fs
          .stat(WORKING_DIRECTORY)
          .then(() => true)
          .catch(() => false))
      ) {
        await fs.mkdir(WORKING_DIRECTORY, { recursive: true });
      }
      try {
        const files = await fs.readdir(WORKING_DIRECTORY);
        for (const file of files) {
          writtenFiles.push(file);
        }
      } catch (error) {
        console.error(error);
      }
      const filesList = writtenFiles.length > 0
        ? "\nBelow are files your team has written to the directory:\n" +
          writtenFiles.map((f) => ` - ${f}`).join("\n")
        : "No files written.";
      return { ...state, current_files: filesList };
    },
});
  
const agentStateModifier = (
    systemPrompt: string,
    tools: StructuredToolInterface[],
    teamMembers: string[],
  ): ((state: typeof MessagesAnnotation.State) => BaseMessage[]) => {
    const toolNames = tools.map((t) => t.name).join(", ");
    const systemMsgStart = new SystemMessage(systemPrompt +
      "\nWork autonomously according to your specialty, using the tools available to you." +
      " Do not ask for clarification." +
      " Your other team members (and other teams) will collaborate with you with their own specialties." +
      ` You are chosen for a reason! You are one of the following team members: ${teamMembers.join(", ")}.`)
    const systemMsgEnd = new SystemMessage(`Supervisor instructions: ${systemPrompt}\n` +
        `Remember, you individually can only use these tools: ${toolNames}` +
        "\n\nEnd if you have already completed the requested task. Communicate the work completed.");
  
    return (state: typeof MessagesAnnotation.State): any[] => 
      [systemMsgStart, ...state.messages, systemMsgEnd];
  }
  
  
async function runAgentNode(params: {
    state: any;
    agent: Runnable;
    name: string;
}) {
    const { state, agent, name } = params;
    const result = await agent.invoke({
      messages: state.messages,
    });
    const lastMessage = result.messages[result.messages.length - 1];
    return {
      messages: [new HumanMessage({ content: lastMessage.content, name })],
    };
}

async function createTeamSupervisor(
  llm: ChatCohere,
  systemPrompt: string,
  members: string[],
): Promise<Runnable> {
  const options = ["FINISH", ...members];
  const routeTool = {
    name: "route",
    description: "Select the next role.",
    schema: z.object({
      reasoning: z.string(),
      next: z.enum(["FINISH", ...members]),
      instructions: z.string().describe("The specific instructions of the sub-task the next role should accomplish."),
    })
  }
  let prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    new MessagesPlaceholder("messages"),
    [
      "system",
      "Given the conversation above, who should act next? Or should we FINISH? Select one of: {options}",
    ],
  ]);
  prompt = await prompt.partial({
    options: options.join(", "),
    team_members: members.join(", "),
  });

  const supervisor = prompt
    .pipe(
      llm.bindTools([routeTool], {
        tool_choice: "route",
      }),
    )
    .pipe(new JsonOutputToolsParser())
    // select the first one
    .pipe((x) => ({
      next: x[0].args.next,
      instructions: x[0].args.instructions,
    }));

  return supervisor;
}

export { prelude, agentStateModifier, runAgentNode, createTeamSupervisor }