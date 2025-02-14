import { BaseMessage } from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph";
import { END, START, StateGraph } from "@langchain/langgraph";
import { ResearchTeamState } from "../State/researchTeamState";

const researchGraph = new StateGraph(ResearchTeamState)
  .addNode("Search", searchNode)
  .addNode("supervisor", supervisorAgent)
  .addNode("WebScraper", researchNode)
  // Define the control flow
  .addEdge("Search", "supervisor")
  .addEdge("WebScraper", "supervisor")
  .addConditionalEdges("supervisor", (x) => x.next, {
    Search: "Search",
    WebScraper: "WebScraper",
    FINISH: END,
  })
  .addEdge(START, "supervisor");

export const researchChain = researchGraph.compile();