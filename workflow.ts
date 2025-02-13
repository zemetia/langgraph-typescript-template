
import { START, END, Annotation, StateGraph } from "@langchain/langgraph";
import { members } from "./Agents/Supervisor/supervisorLLM";
import { BaseMessage } from "@langchain/core/messages";

const AgentState = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
      reducer: (x, y) => x.concat(y),
      default: () => [],
    }),
    // The agent node that last performed work
    next: Annotation<string>({
      reducer: (x, y) => y ?? x ?? END,
      default: () => END,
    }),
});

const workflow = new StateGraph(AgentState)
  .addNode("researcher", researcherNode)
  .addNode("chart_generator", chartGenNode)
  .addNode("supervisor", supervisorChain);

members.forEach((member) => {
  workflow.addEdge(member, "supervisor");
});

// workflow.addConditionalEdges(
//   "supervisor",
//   (x: typeof AgentState.State) => x.next,
// );

workflow.addEdge(START, "supervisor");

const APP = workflow.compile();