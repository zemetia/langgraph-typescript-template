import { DocWritingState } from "../../Workflow/State/authoringState";
import { agentStateModifier, prelude, runAgentNode } from "../../Helper/helper";
import { readDocumentTool } from "../DocWriter/DocWriterTools";
import { createOutlineTool } from "./noteTakingTools";
import { docWritingLlm } from "../DocWriter/DocWriterLLM";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

const noteTakingNode = (state: typeof DocWritingState.State) => {
  const stateModifier = agentStateModifier(
    "You are an expert senior researcher tasked with writing a paper outline and" +
    ` taking notes to craft a perfect paper. ${state.current_files}`,
    [createOutlineTool, readDocumentTool],
    state.team_members ?? [],
  )

  const noteTakingAgent = createReactAgent({
    llm: docWritingLlm,
    tools: [createOutlineTool, readDocumentTool],
    stateModifier,
  })
  const contextAwareNoteTakingAgent = prelude.pipe(noteTakingAgent);
  return runAgentNode({ state, agent: contextAwareNoteTakingAgent, name: "NoteTaker" });
}