import { CodeXml, Eye, KeyRound, Play, RotateCcw, Square } from "lucide-react";
import { useMemo, useState } from "react";
import type { EditableField, Example, PromptSpec } from "../content/types";
import { resolveRequest } from "../lib/claude";
import { getDemo } from "../lib/demo";
import { useAppState } from "../lib/storage";
import { btn, openKeyDialog } from "../lib/ui";
import { useRunner } from "../lib/useRunner";
import { CodeView } from "./CodeView";
import { Markdown } from "./Markdown";
import { PromptFields } from "./PromptFields";
import { ResponseView } from "./ResponseView";

interface Props {
  example: Example;
  /** Small label above the card, e.g. "Before" / "After". */
  badge?: { text: string; tone: "before" | "after" | "neutral" };
  freeform?: boolean;
}

function defaultEditable(p: PromptSpec): EditableField[] {
  const f: EditableField[] = ["user", "system", "variables"];
  if (p.history?.length) f.push("history");
  return f;
}

export function PromptPlayground({ example, badge, freeform }: Props) {
  const { apiKey } = useAppState();
  const [spec, setSpec] = useState<PromptSpec>(example.prompt);
  const [showCode, setShowCode] = useState(false);
  const { state, run, stop, showDemo, reset } = useRunner();
  const editable = example.editable ?? defaultEditable(example.prompt);
  const edited = useMemo(() => JSON.stringify(spec) !== JSON.stringify(example.prompt), [spec, example.prompt]);
  const demo = useMemo(() => (apiKey ? null : getDemo(example.id, spec)), [apiKey, example.id, spec]);
  const { model } = useAppState();
  const running = state.status === "running";

  const onRun = () => {
    if (apiKey) void run(spec);
    else if (demo) showDemo(demo);
    else openKeyDialog();
  };

  return (
    <section
      className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card"
      aria-label={example.title ?? "Prompt playground"}
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !running) {
          e.preventDefault();
          onRun();
        }
      }}
    >
      {(example.title || badge) && (
        <header className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3 sm:px-5">
          {badge && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${
                badge.tone === "before" ? "bg-danger-soft text-danger" : badge.tone === "after" ? "bg-success-soft text-success" : "bg-tag-bg text-tag"
              }`}
            >
              {badge.text}
            </span>
          )}
          {example.title && <h4 className="font-semibold">{example.title}</h4>}
        </header>
      )}

      <div className="space-y-4 p-4 sm:p-5">
        {example.note && <Markdown className="prose-lesson prose-sm text-muted">{example.note}</Markdown>}

        <PromptFields
          spec={spec}
          onChange={setSpec}
          editable={editable}
          showSystem={example.showSystem}
          freeform={freeform}
          showEffort={example.prompt.effort !== undefined}
          idPrefix={example.id}
        />

        <div className="flex flex-wrap items-center gap-2">
          {running ? (
            <button type="button" className={btn.secondary} onClick={stop}>
              <Square className="size-4 fill-current" aria-hidden /> Stop
            </button>
          ) : apiKey ? (
            <button type="button" className={btn.primary} onClick={onRun}>
              <Play className="size-4 fill-current" aria-hidden /> {state.status === "idle" ? "Run" : "Run again"}
            </button>
          ) : demo ? (
            <button type="button" className={btn.primary} onClick={onRun}>
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
                setSpec(example.prompt);
                reset();
              }}
            >
              <RotateCcw className="size-4" aria-hidden /> Reset
            </button>
          )}
          <button type="button" className={btn.ghost} onClick={() => setShowCode((s) => !s)} aria-pressed={showCode}>
            <CodeXml className="size-4" aria-hidden /> {showCode ? "Hide code" : "View as code"}
          </button>
          {!apiKey && (
            <span className="text-xs text-faint">
              {demo ? "Demo mode: showing a recorded answer." : edited ? "Edited prompts need your own key." : "Add a key to run this live."}
            </span>
          )}
          {apiKey && !running && (
            <span className="hidden text-xs text-faint sm:inline">
              <kbd className="font-sans">Ctrl</kbd>/<kbd className="font-sans">⌘</kbd>+<kbd className="font-sans">Enter</kbd> to run
            </span>
          )}
        </div>

        {showCode && <CodeView req={resolveRequest(spec, model)} />}
        <ResponseView state={state} />
      </div>
    </section>
  );
}

export function Compare({
  title,
  before,
  after,
  takeaway,
  labels,
}: {
  title?: string;
  before: Example;
  after: Example;
  takeaway?: string;
  labels?: [string, string];
}) {
  return (
    <div className="space-y-3">
      {title && <h4 className="text-lg font-semibold">{title}</h4>}
      <div className="grid gap-4 2xl:grid-cols-2">
        <PromptPlayground example={before} badge={labels ? { text: labels[0], tone: "neutral" } : { text: "Before", tone: "before" }} />
        <PromptPlayground example={after} badge={labels ? { text: labels[1], tone: "neutral" } : { text: "After", tone: "after" }} />
      </div>
      {takeaway && <Markdown className="prose-lesson prose-sm rounded-xl bg-surface-2 px-4 py-3">{takeaway}</Markdown>}
    </div>
  );
}
