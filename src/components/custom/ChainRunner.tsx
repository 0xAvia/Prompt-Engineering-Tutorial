import { ArrowDown, KeyRound, Link2, Play, RotateCcw, Square } from "lucide-react";
import { useRef, useState } from "react";
import { CHAINS } from "../../content/chains";
import type { PromptSpec, Turn } from "../../content/types";
import { friendlyError, isAbort, runPrompt } from "../../lib/claude";
import { getAppState, useAppState } from "../../lib/storage";
import { btn, openKeyDialog } from "../../lib/ui";
import type { RunState } from "../../lib/useRunner";
import { PromptEditor } from "../PromptEditor";
import { ResponseView } from "../ResponseView";

const IDLE: RunState = { status: "idle", text: "", thinking: "" };

/** Runs a sequence of prompts where each step builds on the previous one's output. */
export function ChainRunner({ preset }: { preset: string }) {
  const chain = CHAINS[preset];
  const { apiKey } = useAppState();
  const [prompts, setPrompts] = useState(() => chain.steps.map((s) => s.user));
  const [states, setStates] = useState<RunState[]>(() => chain.steps.map(() => IDLE));
  const ctrl = useRef<AbortController | null>(null);
  const running = states.some((s) => s.status === "running");
  const edited = prompts.some((p, i) => p !== chain.steps[i].user);

  const setState = (i: number, patch: Partial<RunState>) => setStates((prev) => prev.map((s, j) => (j === i ? { ...s, ...patch } : s)));

  const run = async () => {
    if (!apiKey) return openKeyDialog();
    ctrl.current?.abort();
    const c = new AbortController();
    ctrl.current = c;
    const { model } = getAppState();
    setStates(chain.steps.map(() => IDLE));
    const history: Turn[] = [];
    let previous = "";
    for (let i = 0; i < chain.steps.length; i++) {
      const step = chain.steps[i];
      const spec: PromptSpec =
        step.mode === "continue"
          ? { history: [...history], user: prompts[i] }
          : { user: prompts[i], variables: { PREVIOUS: previous } };
      if (step.mode === "new") history.length = 0;
      setState(i, { status: "running", text: "", thinking: "", source: "live" });
      const t0 = performance.now();
      try {
        const result = await runPrompt(spec, { apiKey, modelId: model, signal: c.signal, onText: (text) => setState(i, { text }) });
        setState(i, { status: "done", text: result.text, result, elapsedMs: performance.now() - t0 });
        history.push({ role: "user", content: step.mode === "new" ? prompts[i].replaceAll("{PREVIOUS}", previous) : prompts[i] });
        history.push({ role: "assistant", content: result.text });
        previous = result.text;
      } catch (e) {
        if (isAbort(e) || c.signal.aborted) setState(i, { status: "stopped" });
        else setState(i, { status: "error", error: friendlyError(e) });
        return;
      }
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      <header className="border-b border-line px-4 py-3 sm:px-5">
        <h4 className="flex items-center gap-2 font-semibold">
          <Link2 className="size-4 text-accent" aria-hidden /> {chain.title}
        </h4>
        <p className="text-sm text-muted">{chain.description}</p>
      </header>
      <div className="space-y-3 p-4 sm:p-5">
        {chain.steps.map((step, i) => (
          <div key={i}>
            {i > 0 && (
              <div className="flex items-center gap-2 py-1 pl-3 text-xs font-medium text-muted">
                <ArrowDown className="size-4 text-accent" aria-hidden />
                {step.mode === "continue" ? "Continues the same conversation" : "Step " + i + "'s answer goes into {PREVIOUS}"}
              </div>
            )}
            <div className="space-y-3 rounded-xl border border-line-strong p-3.5">
              <p className="text-[0.8rem] font-semibold uppercase tracking-wide text-muted">Step {i + 1}</p>
              <div className="rounded-xl border border-line-strong bg-surface focus-within:border-accent">
                <PromptEditor label={`Step ${i + 1} prompt`} value={prompts[i]} onChange={(v) => setPrompts((p) => p.map((x, j) => (j === i ? v : x)))} />
              </div>
              <ResponseView state={states[i]} label={`Step ${i + 1} answer`} compact />
            </div>
          </div>
        ))}
        <div className="flex flex-wrap gap-2 pt-1">
          {running ? (
            <button type="button" className={btn.secondary} onClick={() => ctrl.current?.abort()}>
              <Square className="size-4 fill-current" aria-hidden /> Stop
            </button>
          ) : (
            <button type="button" className={btn.primary} onClick={run}>
              {apiKey ? <Play className="size-4 fill-current" aria-hidden /> : <KeyRound className="size-4" aria-hidden />}
              {apiKey ? "Run the chain" : "Add API key to run"}
            </button>
          )}
          {edited && !running && (
            <button
              type="button"
              className={btn.ghost}
              onClick={() => {
                setPrompts(chain.steps.map((s) => s.user));
                setStates(chain.steps.map(() => IDLE));
              }}
            >
              <RotateCcw className="size-4" aria-hidden /> Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
