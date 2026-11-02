import type { CustomComponent } from "../../content/types";
import { MessageAnatomy } from "./MessageAnatomy";

/** Interactive widgets that don't fit the standard blocks. */
export function CustomBlock({ component }: { component: CustomComponent }) {
  switch (component) {
    case "message-anatomy":
      return <MessageAnatomy />;
    default:
      return <p className="text-sm text-muted">Interactive widget “{component}” coming soon.</p>;
  }
}
