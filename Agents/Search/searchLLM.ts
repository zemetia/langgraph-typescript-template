import { ChatCohere } from "@langchain/cohere";
import { ResearchTeamState } from "../../Workflow/State/researchTeamState";
import { agentStateModifier, runAgentNode } from "../../Helper/helper"
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tavilyTool } from "./SearchTools";

const researchTeamLlm = new ChatCohere({ model: "command-r" });

const searchNode = (state: typeof ResearchTeamState.State) => {
  const stateModifier = agentStateModifier(
    "You are a research assistant who can search for up-to-date info using the tavily search engine.",
    [tavilyTool],
    state.team_members ?? ["Search"],
  )
  const searchAgent = createReactAgent({
    llm: researchTeamLlm,
    tools: [tavilyTool],
    stateModifier,
  })
  return runAgentNode({ state, agent: searchAgent, name: "Search" });
};

export { researchTeamLlm }