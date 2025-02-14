import { agentStateModifier, prelude, runAgentNode } from "../../Helper/helper";
import { chartTool } from "./ChartGeneratorTools";
import { readDocumentTool } from "../DocWriter/DocWriterTools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { DocWritingState } from "../../Workflow/State/authoringState";
import { ChatCohere } from "@langchain/cohere";

export const members = ["researcher", "chart_generator"] as const;

const docWritingLlm = new ChatCohere({ model: "command-r" });

const chartGeneratingNode = async (
  state: typeof DocWritingState.State,
) => {
  const stateModifier = agentStateModifier(
    "You are a data viz expert tasked with generating charts for a research project." +
    `${state.current_files}`,
    [readDocumentTool, chartTool],
    state.team_members ?? [],
  )
  const chartGeneratingAgent = createReactAgent({
    llm: docWritingLlm,
    tools: [readDocumentTool, chartTool],
    stateModifier,
  })
  const contextAwareChartGeneratingAgent = prelude.pipe(chartGeneratingAgent);
  return runAgentNode({ state, agent: contextAwareChartGeneratingAgent, name: "ChartGenerator" });
}