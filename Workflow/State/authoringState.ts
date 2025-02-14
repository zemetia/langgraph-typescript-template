
import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

export const DocWritingState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
  team_members: Annotation<string[]>({
    reducer: (x, y) => x.concat(y),
  }),
  next: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "supervisor",
  }),
  current_files: Annotation<string>({
    reducer: (x, y) => (y ? `${x}\n${y}` : x),
    default: () => "No files written.",
  }),
  instructions: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "Solve the human's question.",
  }),
})