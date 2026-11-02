import { Braces, Brain, ChevronRight, Lock, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { EditableField, Effort, PromptSpec, Turn } from "../content/types";
import { findVariables } from "../lib/template";
import { FilledPrompt } from "./HighlightedText";
import { PromptEditor } from "./PromptEditor";

interface Props {
  spec: PromptSpec;
  onChange: (spec: PromptSpec) => void;
  editable: EditableField[];
  /** Show the system prompt box even if the example has none. */
  showSystem?: boolean;
  /** Free playground: add/remove turns and choose the effort level. */
  freeform?: boolean;
  /** Show the effort selector. */
  showEffort?: boolean;
  /** Placeholders filled in per test case by a multi-input exercise. */
  caseVars?: string[];
  idPrefix: string;
}

function FieldLabel({ children, sub, locked }: { children: React.ReactNode; sub?: string; locked?: boolean }) {
  return (
    <div className="mb-1.5 flex flex-wrap items-baseline gap-x-2">
      <span className="text-[0.8rem] font-semibold uppercase tracking-wide text-muted">{children}</span>
      {sub && <span className="text-xs text-faint">{sub}</span>}
      {locked && (
        <span className="ml-auto inline-flex items-center gap-1 text-xs text-faint" title="This part is fixed for this exercise">
          <Lock className="size-3" aria-hidden /> fixed
        </span>
      )}
    </div>
  );
}

function EditorBox({ locked, tone = "default", children }: { locked?: boolean; tone?: "default" | "assistant"; children: React.ReactNode }) {
  return (
    <div
      className={`rounded-xl border transition-colors ${
        locked
          ? "border-line bg-surface-2/70"
          : "border-line-strong bg-surface focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20"
      } ${tone === "assistant" ? "border-l-4 !border-l-accent/50" : ""}`}
    >
      {children}
    </div>
  );
}

export function PromptFields({ spec, onChange, editable, showSystem, freeform, showEffort, caseVars, idPrefix }: Props) {
  const can = (f: EditableField) => editable.includes(f);
  const history = spec.history ?? [];
  const vars = findVariables(spec.system, spec.user, ...history.map((t) => t.content));
  const [previewOpen, setPreviewOpen] = useState(false);

  const setHistory = (h: Turn[]) => onChange({ ...spec, history: h.length ? h : undefined });

  return (
    <div className="space-y-4">
      {(spec.system !== undefined || showSystem || freeform) && (
        <div>
          <FieldLabel sub="optional ground rules for Claude" locked={!can("system")}>
            System prompt
          </FieldLabel>
          <EditorBox locked={!can("system")}>
            <PromptEditor
              label="System prompt"
              value={spec.system ?? ""}
              readOnly={!can("system")}
              placeholder={can("system") ? "e.g. You are a patient teacher who explains things simply." : "(no system prompt)"}
              onChange={(v) => onChange({ ...spec, system: v })}
            />
          </EditorBox>
        </div>
      )}

      {history.map((turn, i) => (
        <div key={i}>
          <FieldLabel locked={!can("history") && !freeform}>
            {turn.role === "user" ? "You (user turn)" : "Claude (assistant turn)"}
          </FieldLabel>
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <EditorBox locked={!can("history") && !freeform} tone={turn.role === "assistant" ? "assistant" : "default"}>
                <PromptEditor
                  label={`Turn ${i + 1}: ${turn.role}`}
                  value={turn.content}
                  readOnly={!can("history") && !freeform}
                  onChange={(v) => setHistory(history.map((t, j) => (j === i ? { ...t, content: v } : t)))}
                />
              </EditorBox>
            </div>
            {freeform && i % 2 === 0 && (
              <button
                type="button"
                className="mt-1 rounded-lg p-2 text-faint hover:bg-surface-2 hover:text-danger"
                aria-label="Remove this pair of turns"
                title="Remove this user + Claude pair"
                onClick={() => setHistory(history.filter((_, j) => j !== i && j !== i + 1))}
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        </div>
      ))}

      <div>
        <FieldLabel sub={history.length ? "the newest message" : undefined} locked={!can("user")}>
          Your message (user turn)
        </FieldLabel>
        <EditorBox locked={!can("user")}>
          <PromptEditor
            label="Your message to Claude"
            value={spec.user}
            readOnly={!can("user")}
            minHeight="4.5rem"
            placeholder="Write your prompt here…"
            onChange={(v) => onChange({ ...spec, user: v })}
          />
        </EditorBox>
        {freeform && (
          <button
            type="button"
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-accent"
            onClick={() =>
              setHistory([
                ...history,
                { role: "user", content: "" },
                { role: "assistant", content: "" },
              ])
            }
          >
            <Plus className="size-3.5" aria-hidden /> Add earlier turns (fake a conversation history)
          </button>
        )}
      </div>

      {vars.length > 0 && (
        <div className="rounded-xl border border-dashed border-var/40 bg-var-bg/40 p-3.5">
          <FieldLabel sub="these get swapped into the {placeholders} before sending" locked={!can("variables")}>
            Fill in the blanks
          </FieldLabel>
          <div className="space-y-2.5">
            {vars.map((name) => {
              const has = spec.variables && name in spec.variables;
              return (
                <label key={name} className="block" htmlFor={`${idPrefix}-var-${name}`}>
                  <span className="tok-var mb-1 inline-block px-1 font-mono text-xs">{`{${name}}`}</span>
                  {caseVars?.includes(name) ? (
                    <span className="ml-2 text-xs text-muted">Filled in from each test input below when you run the exercise.</span>
                  ) : !has && !can("variables") && !freeform ? (
                    <span className="ml-2 text-xs text-warning">No value for this placeholder: it will be sent as written.</span>
                  ) : (
                    <textarea
                      id={`${idPrefix}-var-${name}`}
                      rows={Math.min(8, Math.max(1, (spec.variables?.[name] ?? "").split("\n").length))}
                      readOnly={!can("variables") && !freeform}
                      value={spec.variables?.[name] ?? ""}
                      onChange={(e) => onChange({ ...spec, variables: { ...spec.variables, [name]: e.target.value } })}
                      className="block w-full resize-y rounded-lg border border-line-strong bg-surface px-3 py-2 font-mono text-sm read-only:bg-surface-2/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  )}
                </label>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setPreviewOpen((o) => !o)}
            aria-expanded={previewOpen}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-ink"
          >
            <ChevronRight className={`size-3.5 transition-transform ${previewOpen ? "rotate-90" : ""}`} aria-hidden />
            Preview what Claude actually receives
          </button>
          {previewOpen && (
            <div className="mt-2 space-y-2 rounded-lg border border-line bg-surface p-3 font-mono text-[0.82rem] leading-relaxed">
              {spec.system?.trim() && (
                <div>
                  <p className="mb-1 font-sans text-[0.7rem] font-semibold uppercase tracking-wide text-faint">System</p>
                  <div className="whitespace-pre-wrap break-words">
                    <FilledPrompt text={spec.system} vars={spec.variables} />
                  </div>
                </div>
              )}
              <div>
                <p className="mb-1 font-sans text-[0.7rem] font-semibold uppercase tracking-wide text-faint">User</p>
                <div className="whitespace-pre-wrap break-words">
                  <FilledPrompt text={spec.user} vars={spec.variables} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {spec.outputSchema && (
        <details className="group rounded-xl border border-tag/30 bg-tag-bg/40 px-3.5 py-2.5">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm">
            <Braces className="size-4 text-tag" aria-hidden />
            <span>
              <span className="font-medium">Structured output is on:</span>{" "}
              <span className="text-muted">the API guarantees the answer matches this JSON schema</span>
            </span>
            <ChevronRight className="ml-auto size-4 text-faint transition-transform group-open:rotate-90" aria-hidden />
          </summary>
          <pre className="mt-2 overflow-x-auto font-mono text-[0.78rem] leading-relaxed">{JSON.stringify(spec.outputSchema, null, 2)}</pre>
        </details>
      )}

      {(showEffort || freeform) && <EffortPicker value={spec.effort ?? "low"} onChange={(effort) => onChange({ ...spec, effort })} />}
    </div>
  );
}

const EFFORTS: { value: Effort; label: string; hint: string }[] = [
  { value: "low", label: "Low", hint: "fast and cheap; fine for simple tasks" },
  { value: "medium", label: "Medium", hint: "thinks more on harder problems" },
  { value: "high", label: "High", hint: "most thorough; slower and uses more tokens" },
];

/** How hard Claude thinks before answering (the API's `effort` setting). */
function EffortPicker({ value, onChange }: { value: Effort; onChange: (e: Effort) => void }) {
  const current = EFFORTS.find((e) => e.value === value)!;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-line bg-surface-2/50 px-3.5 py-2.5">
      <span className="flex items-center gap-2 text-sm font-medium">
        <Brain className="size-4 text-muted" aria-hidden /> Effort
      </span>
      <div className="inline-flex rounded-lg border border-line-strong bg-surface p-0.5" role="radiogroup" aria-label="Effort">
        {EFFORTS.map((e) => (
          <button
            key={e.value}
            type="button"
            role="radio"
            aria-checked={value === e.value}
            onClick={() => onChange(e.value)}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${value === e.value ? "bg-accent text-on-accent" : "text-muted hover:text-ink"}`}
          >
            {e.label}
          </button>
        ))}
      </div>
      <span className="text-xs text-muted">How hard Claude thinks before answering: {current.hint}.</span>
    </div>
  );
}
