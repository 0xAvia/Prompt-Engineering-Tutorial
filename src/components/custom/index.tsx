import type { CustomComponent } from "../../content/types";
import { ChainRunner } from "./ChainRunner";
import { MessageAnatomy } from "./MessageAnatomy";
import { PromptBuilder } from "./PromptBuilder";
import { RetrievalSandbox } from "./RetrievalSandbox";
import { CalculatorSandbox, DatabaseExercise } from "./ToolSandbox";

/** Interactive widgets that don't fit the standard blocks. */
export function CustomBlock({ component, preset }: { component: CustomComponent; preset?: string }) {
  switch (component) {
    case "message-anatomy":
      return <MessageAnatomy />;
    case "prompt-builder":
      return <PromptBuilder />;
    case "chain-runner":
      return <ChainRunner preset={preset ?? "fix-words"} />;
    case "calculator-sandbox":
      return <CalculatorSandbox />;
    case "database-exercise":
      return <DatabaseExercise />;
    case "retrieval-sandbox":
      return <RetrievalSandbox />;
  }
}
