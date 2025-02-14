import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { agentStateModifier, runAgentNode } from "../../Helper/helper";
import { ResearchTeamState } from "../../Workflow/State/researchTeamState";
import { scrapeWebpage } from "./researchTools";
import { researchTeamLlm } from "../Search/SearchLLM";


const researchNode = (state: typeof ResearchTeamState.State) => {
  const stateModifier = agentStateModifier(
    "You are a research assistant who can scrape specified urls for more detailed information using the scrapeWebpage function.",
    [scrapeWebpage],
    state.team_members ?? ["WebScraper"],
  )
  const researchAgent = createReactAgent({
    llm: researchTeamLlm,
    tools: [scrapeWebpage],
    stateModifier,
  })
  return runAgentNode({ state, agent: researchAgent, name: "WebScraper" });
}