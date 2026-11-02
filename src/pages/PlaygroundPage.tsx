import { useEffect } from "react";
import { PromptPlayground } from "../components/PromptPlayground";
import type { Example } from "../content/types";
import { site } from "../site";

const blank: Example = {
  id: "free-playground",
  prompt: { system: "", user: "", thinking: false },
  editable: ["system", "user", "history", "variables"],
};

export function PlaygroundPage() {
  useEffect(() => {
    document.title = `Playground · ${site.name}`;
  }, []);
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Playground</h1>
      <p className="mt-2 max-w-2xl text-muted">
        A blank canvas to try anything you've learned. Use a system prompt, fake an earlier conversation, add <span className="tok-var px-1 font-mono text-sm">{"{PLACEHOLDERS}"}</span>{" "}
        to make a template, or switch on built-in thinking.
      </p>
      <div className="mt-6">
        <PromptPlayground example={blank} freeform />
      </div>
    </div>
  );
}
