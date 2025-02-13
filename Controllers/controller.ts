// disini bakal jadi function yang nanti di pake di workflow
// anggap aja itu sebagai controller function

import { HumanMessage } from "@langchain/core/messages"
import { supervisorLlm } from "../Agents/Supervisor/supervisorLLM"

const supervisorAgentChain = async () => {
    (await supervisorLlm()).invoke({
        messages: [
          new HumanMessage({
            content: "write a report on birds.",
          }),
        ],
      })
}