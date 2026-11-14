import { type GraphState } from "../graph";

export function identifyIntent(state: GraphState): GraphState {
  const input = state.messages.at(-1)?.text ?? "";
  const inputLower = input.toLowerCase();

  let command: GraphState["command"] = "unkown";

  if (inputLower.includes("uppper")) {
    command = "uppercase";
  } else if (inputLower.includes("lower")) {
    command = "lowercase";
  }

  return {
    ...state,
    command,
    output: input,
  };
}
