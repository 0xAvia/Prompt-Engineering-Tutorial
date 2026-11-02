import { Lightbulb, WandSparkles } from "lucide-react";
import { useState } from "react";
import type { PromptSpec } from "../content/types";
import { btn } from "../lib/ui";
import { Markdown } from "./Markdown";

interface Props {
  hints: string[];
  solution?: PromptSpec;
  onUseSolution?: (s: PromptSpec) => void;
}

/** Reveal hints one at a time, then optionally a sample solution. */
export function HintLadder({ hints, solution, onUseSolution }: Props) {
  const [shown, setShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const allHintsShown = shown >= hints.length;

  return (
    <div className="space-y-3">
      {hints.slice(0, shown).map((h, i) => (
        <div key={i} className="flex gap-3 rounded-xl border border-warning/30 bg-warning-soft px-4 py-3">
          <Lightbulb className="mt-1 size-4 shrink-0 text-warning" aria-hidden />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-warning">Hint {i + 1}</p>
            <Markdown className="prose-lesson prose-sm">{h}</Markdown>
          </div>
        </div>
      ))}

      {showSolution && solution && (
        <div className="rounded-xl border border-tag/30 bg-tag-bg/60 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-tag">One possible solution</p>
          <div className="space-y-2 font-mono text-[0.82rem] leading-relaxed">
            {solution.system && (
              <div>
                <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-wide text-faint">System prompt</p>
                <p className="whitespace-pre-wrap break-words">{solution.system}</p>
              </div>
            )}
            {solution.history?.map((t, i) => (
              <div key={i}>
                <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-wide text-faint">{t.role === "user" ? "User" : "Claude"}</p>
                <p className="whitespace-pre-wrap break-words">{t.content}</p>
              </div>
            ))}
            <div>
              <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-wide text-faint">Your message</p>
              <p className="whitespace-pre-wrap break-words">{solution.user}</p>
            </div>
          </div>
          {onUseSolution && (
            <button type="button" className={`${btn.secondary} mt-3 !py-1.5`} onClick={() => onUseSolution(solution)}>
              Copy into the editor
            </button>
          )}
          <p className="mt-2 text-xs text-muted">Claude's answers vary, so even a good solution can occasionally miss. Run it again if it does.</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {!allHintsShown && (
          <button type="button" className={btn.ghost} onClick={() => setShown((n) => n + 1)}>
            <Lightbulb className="size-4" aria-hidden /> {shown === 0 ? "Need a hint?" : "Show another hint"}
          </button>
        )}
        {allHintsShown && solution && !showSolution && (
          <button type="button" className={btn.ghost} onClick={() => setShowSolution(true)}>
            <WandSparkles className="size-4" aria-hidden /> Show a sample solution
          </button>
        )}
      </div>
    </div>
  );
}
