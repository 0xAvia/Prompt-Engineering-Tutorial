import { ChevronRight, Eye, KeyRound, Play, RotateCcw, Square } from "lucide-react";
import { useMemo, useState } from "react";
import { BUILDER_DEFAULTS, BUILDER_HISTORY as HISTORY, BUILDER_QUESTION as QUESTION, assemble, type PromptElement } from "../../content/builder";
import type { PromptSpec } from "../../content/types";
import { getDemo } from "../../lib/demo";
import { useAppState } from "../../lib/storage";
import { btn, openKeyDialog } from "../../lib/ui";
import { useRunner } from "../../lib/useRunner";
import { FilledPrompt } from "../HighlightedText";
import { ResponseView } from "../ResponseView";

export function PromptBuilder() {
  const { apiKey } = useAppState();
  const [elements, setElements] = useState(BUILDER_DEFAULTS);
  const [vars, setVars] = useState({ HISTORY, QUESTION });
  const [open, setOpen] = useState<string | null>("task");
  const { state, run, stop, showDemo, reset } = useRunner();
  const prompt = assemble(elements);
  const spec: PromptSpec = useMemo(() => ({ user: prompt, variables: vars }), [prompt, vars]);
  const demo = useMemo(() => (apiKey ? null : getDemo("9-builder", spec)), [apiKey, spec]);
  const edited = JSON.stringify(elements) !== JSON.stringify(BUILDER_DEFAULTS) || vars.QUESTION !== QUESTION || vars.HISTORY !== HISTORY;
  const running = state.status === "running";

  const update = (key: string, patch: Partial<PromptElement>) => setElements((els) => els.map((e) => (e.key === key ? { ...e, ...patch } : e)));

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      <header className="border-b border-line px-4 py-3 sm:px-5">
        <h4 className="font-semibold">Prompt builder: “Joe”, the career coach</h4>
        <p className="text-sm text-muted">Switch elements on and off, edit them, and watch the full prompt assemble below.</p>
      </header>
      <div className="space-y-5 p-4 sm:p-5">
        <ol className="space-y-2">
          <li className="flex items-start gap-3 rounded-xl border border-dashed border-line px-3.5 py-2.5 text-sm text-muted">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-3 text-xs font-bold text-ink">1</span>
            <span>
              <strong className="text-ink">User turn</strong>: everything below is sent as one user message. (Conversations always start with
              a user turn.)
            </span>
          </li>
          {elements.map((e, i) => {
            const isOpen = open === e.key;
            return (
              <li key={e.key} className={`rounded-xl border transition-colors ${e.on ? "border-line-strong" : "border-line bg-surface-2/50 opacity-70"}`}>
                <div className="flex items-center gap-3 px-3.5 py-2.5">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">{i + 2}</span>
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                    onClick={() => setOpen(isOpen ? null : e.key)}
                    aria-expanded={isOpen}
                  >
                    <ChevronRight className={`size-4 shrink-0 text-faint transition-transform ${isOpen ? "rotate-90" : ""}`} aria-hidden />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{e.label}</span>
                      {!isOpen && <span className="block truncate text-xs text-muted">{e.tip}</span>}
                    </span>
                  </button>
                  <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs font-medium text-muted">
                    <input type="checkbox" className="size-4 accent-[var(--accent)]" checked={e.on} onChange={(ev) => update(e.key, { on: ev.target.checked })} />
                    Include
                  </label>
                </div>
                {isOpen && (
                  <div className="space-y-1.5 px-3.5 pb-3.5">
                    <p className="text-xs text-muted">{e.tip}</p>
                    <textarea
                      value={e.text}
                      aria-label={e.label}
                      rows={Math.min(10, Math.max(2, e.text.split("\n").length + 1))}
                      onChange={(ev) => update(e.key, { text: ev.target.value })}
                      className="block w-full resize-y rounded-lg border border-line-strong bg-surface px-3 py-2 font-mono text-[0.82rem] leading-relaxed focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                )}
              </li>
            );
          })}
          <li className="flex items-start gap-3 rounded-xl border border-dashed border-line px-3.5 py-2.5 text-sm text-muted">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-3 text-xs font-bold text-ink">10</span>
            <span>
              <strong className="text-ink">Prefill</strong>: the original structure ended by writing the start of Claude's reply. Current models
              don't accept that, so put “how to begin” instructions in Output formatting instead.
            </span>
          </li>
        </ol>

        <details className="group rounded-xl border border-dashed border-var/40 bg-var-bg/40 p-3.5">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-semibold">
            <ChevronRight className="size-4 transition-transform group-open:rotate-90" aria-hidden /> The data:{" "}
            <span className="tok-var px-1 font-mono text-xs">{"{HISTORY}"}</span> and <span className="tok-var px-1 font-mono text-xs">{"{QUESTION}"}</span>
          </summary>
          <div className="mt-3 space-y-2.5">
            {(["QUESTION", "HISTORY"] as const).map((k) => (
              <label key={k} className="block">
                <span className="tok-var mb-1 inline-block px-1 font-mono text-xs">{`{${k}}`}</span>
                <textarea
                  value={vars[k]}
                  rows={k === "HISTORY" ? 6 : 2}
                  onChange={(e) => setVars((v) => ({ ...v, [k]: e.target.value }))}
                  className="block w-full resize-y rounded-lg border border-line-strong bg-surface px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none"
                />
              </label>
            ))}
          </div>
        </details>

        <div>
          <p className="mb-1.5 text-[0.8rem] font-semibold uppercase tracking-wide text-muted">The assembled prompt</p>
          <div className="max-h-80 overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-line bg-surface-2/60 p-3.5 font-mono text-[0.8rem] leading-relaxed">
            {prompt ? <FilledPrompt text={prompt} vars={vars} /> : <span className="text-faint">(every element is switched off)</span>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {running ? (
            <button type="button" className={btn.secondary} onClick={stop}>
              <Square className="size-4 fill-current" aria-hidden /> Stop
            </button>
          ) : apiKey ? (
            <button type="button" className={btn.primary} disabled={!prompt} onClick={() => void run(spec)}>
              <Play className="size-4 fill-current" aria-hidden /> Run
            </button>
          ) : demo ? (
            <button type="button" className={btn.primary} onClick={() => showDemo(demo)}>
              <Eye className="size-4" aria-hidden /> Show Claude's answer
            </button>
          ) : (
            <button type="button" className={btn.primary} onClick={openKeyDialog}>
              <KeyRound className="size-4" aria-hidden /> Add API key to run
            </button>
          )}
          {edited && !running && (
            <button
              type="button"
              className={btn.ghost}
              onClick={() => {
                setElements(BUILDER_DEFAULTS);
                setVars({ HISTORY, QUESTION });
                reset();
              }}
            >
              <RotateCcw className="size-4" aria-hidden /> Reset
            </button>
          )}
          <span className="text-xs text-faint">Try: switch off Examples or Rules, or ask Joe something off-topic.</span>
        </div>
        <ResponseView state={state} />
      </div>
    </div>
  );
}
