import { ChatCohere } from "@langchain/cohere";
import { editDocumentTool, readDocumentTool, writeDocumentTool } from "./DocWriterTools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { DocWritingState } from "../../Workflow/State/authoringState";
import { agentStateModifier, prelude, runAgentNode } from "../../Helper/helper";

export const docWritingLlm = new ChatCohere({model: "command-r"})

export const docWritingNode = (state: typeof DocWritingState.State) => {
    const stateModifier = agentStateModifier(
      `You are an expert writing a research document.\nBelow are files currently in your directory:\n${state.current_files}`,
      [writeDocumentTool, editDocumentTool, readDocumentTool],
      state.team_members ?? [],
    )
    const docWriterAgent = createReactAgent({
      llm: docWritingLlm,
      tools: [writeDocumentTool, editDocumentTool, readDocumentTool],
      stateModifier,
    })
    const contextAwareDocWriterAgent = prelude.pipe(docWriterAgent);
    return runAgentNode({ state, agent: contextAwareDocWriterAgent, name: "DocWriter" });
}