import { z } from "zod/v3";
import { BaseMessage } from "langchain";
import { withLangGraph } from "@langchain/langgraph/zod";
import { identifyIntent } from "./nodes/identifyIntentNode.ts";
import { chatResponseNode } from "./nodes/chatResponseNode.ts";
import { END, MessagesZodMeta, START, StateGraph } from "@langchain/langgraph";

const GraphState = z.object({
  messages: withLangGraph(z.custom<BaseMessage[]>(), MessagesZodMeta),
  output: z.string(),
  command: z.enum(["uppercase", "lowercase", "unkown"]),
});

export type GraphState = z.infer<typeof GraphState>;

export function buildGraph() {
  const workflow = new StateGraph({
    stateSchema: GraphState,
  })
    .addNode("identifyIntent", identifyIntent)
    .addNode("chatResponse", chatResponseNode)
    .addEdge(START, "identifyIntent")
    .addEdge("identifyIntent", "chatResponse")
    .addEdge("chatResponse", END);

  return workflow.compile();
}
