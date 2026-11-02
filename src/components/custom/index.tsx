import type { CustomComponent } from "../../content/types";
import { MessageAnatomy } from "./MessageAnatomy";
import { PromptBuilder } from "./PromptBuilder";

/** Interactive widgets that don't fit the standard blocks. */
export function CustomBlock({ component }: { component: CustomComponent }) {
  switch (component) {
    case "message-anatomy":
      return <MessageAnatomy />;
    case "prompt-builder":
      return <PromptBuilder />;
    default:
      return <p className="text-sm text-muted">Interactive widget “{component}” coming soon.</p>;
  }
}
