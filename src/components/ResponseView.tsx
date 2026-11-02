import { Brain, ChevronRight, KeyRound, Sparkles, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { stopNote } from "../lib/claude";
import { estimateCost, formatCost } from "../lib/cost";
import { wordCount } from "../lib/graders";
import { getModel } from "../lib/models";
import type { RunState } from "../lib/useRunner";
import { btn, openKeyDialog } from "../lib/ui";
import { highlightTags } from "./HighlightedText";

interface Props {
  state: RunState;
  wordCounter?: boolean;
  label?: string;
  compact?: boolean;
}

export function ResponseView({ state, wordCounter, label = "Claude's answer", compact }: Props) {
  const { status, text, thinking, result, error, source } = state;
  if (status === "idle") return null;
  const running = status === "running";
  const note = result ? stopNote(result.stopReason) : null;

  return (
    <div className="rounded-xl border border-line bg-surface-2/60" aria-live="polite" aria-busy={running}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line px-3.5 py-2 text-xs">
        <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
          <Sparkles className="size-3.5 text-accent" aria-hidden />
          {label}
        </span>
        {source === "demo" && (
          <span className="rounded-full bg-tag-bg px-2 py-0.5 font-medium text-tag" title="Recorded from a real run. Add your API key to run it live.">
            Recorded answer
          </span>
        )}
        {running && <span className="text-muted">Claude is writing…</span>}
        {status === "stopped" && <span className="text-muted">Stopped</span>}
        <span className="ml-auto flex flex-wrap items-center gap-x-3 text-faint">
          {wordCounter && text && <span className="font-medium text-muted">{wordCount(text)} words</span>}
          {result && (
            <>
              <span>{getModel(result.model).name.replace("Claude ", "")}</span>
              <span title={`${result.inputTokens} tokens in, ${result.outputTokens} tokens out`}>
                {(result.inputTokens + result.outputTokens).toLocaleString()} tokens
              </span>
              <span title="Estimated cost of this run">{formatCost(estimateCost(result.model, { inputTokens: result.inputTokens, outputTokens: result.outputTokens }))}</span>
              {state.elapsedMs !== undefined && <span>{(state.elapsedMs / 1000).toFixed(1)}s</span>}
            </>
          )}
        </span>
      </div>

      {thinking && <ThinkingPanel thinking={thinking} running={running && !text} />}

      {(text || running) && (
        <div
          className={`whitespace-pre-wrap break-words px-3.5 py-3 font-mono text-[0.86rem] leading-relaxed ${compact ? "max-h-72" : "max-h-[32rem]"} overflow-y-auto`}
        >
          <span className={running ? "stream-caret" : ""}>{highlightTags(text)}</span>
        </div>
      )}

      {note && <p className="border-t border-line px-3.5 py-2 text-sm text-warning">{note}</p>}

      {status === "error" && error && (
        <div className="flex gap-3 px-3.5 py-3 text-sm" role="alert">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
          <div className="min-w-0">
            <p className="font-semibold text-danger">{error.title}</p>
            <p className="mt-0.5 text-muted">{error.detail}</p>
            {error.keyProblem && (
              <button type="button" className={`${btn.secondary} mt-2 !py-1.5`} onClick={openKeyDialog}>
                <KeyRound className="size-4" aria-hidden /> Update API key
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ThinkingPanel({ thinking, running }: { thinking: string; running: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-xs font-medium text-muted hover:text-ink"
      >
        <ChevronRight className={`size-3.5 transition-transform ${open ? "rotate-90" : ""}`} aria-hidden />
        <Brain className="size-3.5" aria-hidden />
        {running ? "Claude is thinking…" : "What Claude was thinking (summary)"}
      </button>
      {open && <div className="whitespace-pre-wrap px-3.5 pb-3 text-sm italic leading-relaxed text-muted">{thinking}</div>}
    </div>
  );
}
