
import { START, END, Annotation, StateGraph } from "@langchain/langgraph";
import { RunnableLambda } from "@langchain/core/runnables";
import { BaseMessage } from "@langchain/core/messages";
import { DocWritingState } from "../State/authoringState";

const authoringGraph = new StateGraph(DocWritingState)
  .addNode("DocWriter", docWritingNode)
  .addNode("NoteTaker", noteTakingNode)
  .addNode("ChartGenerator", chartGeneratingNode)
  .addNode("supervisor", docWritingSupervisor)
  // Add the edges that always occur
  .addEdge("DocWriter", "supervisor")
  .addEdge("NoteTaker", "supervisor")
  .addEdge("ChartGenerator", "supervisor")
  // Add the edges where routing applies
  .addConditionalEdges("supervisor", (x) => x.next, {
    DocWriter: "DocWriter",
    NoteTaker: "NoteTaker",
    ChartGenerator: "ChartGenerator",
    FINISH: END,
  })
  .addEdge(START, "supervisor");

const enterAuthoringChain = RunnableLambda.from(
  ({ messages }: { messages: BaseMessage[] }) => {
    return {
      messages: messages,
      team_members: ["Doc Writer", "Note Taker", "Chart Generator"],
    };
  },
);

export const authoringChain = enterAuthoringChain.pipe(authoringGraph.compile());