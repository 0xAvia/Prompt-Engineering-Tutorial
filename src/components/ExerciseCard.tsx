import { ChevronDown, CircleCheck, CircleX, KeyRound, LoaderCircle, MessageSquare, PartyPopper, Play, RotateCcw, Square, Trophy } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import type { Exercise, PromptSpec, TestCase } from "../content/types";
import { friendlyError, isAbort, runPrompt, type FriendlyError } from "../lib/claude";
import { allPass, grade, type GradeResult } from "../lib/graders";
import { getAppState, markSolved, useAppState } from "../lib/storage";
import { btn, openKeyDialog } from "../lib/ui";
import { useRunner } from "../lib/useRunner";
import { Checklist } from "./Checklist";
import { highlightTags } from "./HighlightedText";
import { HintLadder } from "./HintLadder";
import { Markdown } from "./Markdown";
import { PromptFields } from "./PromptFields";
import { ResponseView } from "./ResponseView";

interface Graded {
  prompt: GradeResult[];
  response: GradeResult[];
  pass: boolean;
}

interface CaseState {
  status: "pending" | "running" | "done" | "error";
  text: string;
  pass?: boolean;
  results?: GradeResult[];
  error?: FriendlyError;
}

/** The learner's template text, before {VARIABLES} are filled in. */
function templateText(spec: PromptSpec): string {
  return [spec.system ?? "", ...(spec.history ?? []).map((t) => t.content), spec.user].join("\n");
}

export function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const { apiKey, progress } = useAppState();
  const solved = !!progress.solved[exercise.id];
  const [spec, setSpec] = useState<PromptSpec>(exercise.start);
  const [graded, setGraded] = useState<Graded | null>(null);
  const [justSolved, setJustSolved] = useState(false);
  const single = useRunner();
  const multi = useMultiCase(exercise.cases);
  const isMulti = !!exercise.cases?.length;
  const isRubric = !!exercise.rubric?.length;
  const running = single.state.status === "running" || multi.running;
  const edited = JSON.stringify(spec) !== JSON.stringify(exercise.start);

  const succeed = () => {
    markSolved(exercise.id);
    setJustSolved(true);
  };

  const onCheck = async () => {
    if (!apiKey) return openKeyDialog();
    setGraded(null);
    setJustSolved(false);
    const promptResults = grade(templateText(spec), exercise.promptCriteria ?? []);
    if (isMulti) {
      const results = await multi.runAll(spec);
      if (!results) return;
      const pass = results.every(Boolean) && (promptResults.length === 0 || allPass(promptResults));
      setGraded({ prompt: promptResults, response: [], pass });
      if (pass) succeed();
      return;
    }
    const result = await single.run(spec);
    if (!result) return;
    if (isRubric) return; // graded by the learner's self-check
    const responseResults = grade(result.text, exercise.criteria ?? []);
    const pass = allPass([...promptResults, ...responseResults]);
    setGraded({ prompt: promptResults, response: responseResults, pass });
    if (pass) succeed();
  };

  const stop = () => {
    single.stop();
    multi.stop();
  };

  return (
    <section
      className={`overflow-hidden rounded-2xl border-2 bg-surface shadow-card ${solved ? "border-success/40" : "border-accent/30"}`}
      aria-labelledby={`ex-${exercise.id}`}
    >
      <header className="flex flex-wrap items-center gap-2 border-b border-line bg-accent-soft/50 px-4 py-3 sm:px-5">
        <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-on-accent">Exercise {exercise.id}</span>
        <h4 id={`ex-${exercise.id}`} className="font-semibold">
          {exercise.title}
        </h4>
        {solved && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success">
            <CircleCheck className="size-3.5" aria-hidden /> Solved
          </span>
        )}
      </header>

      <div className="space-y-4 p-4 sm:p-5">
        <Markdown>{exercise.goal}</Markdown>

        <PromptFields
          spec={spec}
          onChange={setSpec}
          editable={exercise.editable}
          showThinking={exercise.start.thinking !== undefined}
          idPrefix={`ex-${exercise.id}`}
        />

        <div className="flex flex-wrap items-center gap-2">
          {running ? (
            <button type="button" className={btn.secondary} onClick={stop}>
              <Square className="size-4 fill-current" aria-hidden /> Stop
            </button>
          ) : apiKey ? (
            <button type="button" className={btn.primary} onClick={onCheck}>
              <Play className="size-4 fill-current" aria-hidden />
              {isMulti ? `Run on all ${exercise.cases!.length} inputs & check` : isRubric ? "Run" : "Run & check"}
            </button>
          ) : (
            <button type="button" className={btn.primary} onClick={openKeyDialog}>
              <KeyRound className="size-4" aria-hidden /> Add API key to try this
            </button>
          )}
          {edited && !running && (
            <button
              type="button"
              className={btn.ghost}
              onClick={() => {
                setSpec(exercise.start);
                setGraded(null);
                single.reset();
                multi.reset();
              }}
            >
              <RotateCcw className="size-4" aria-hidden /> Start over
            </button>
          )}
        </div>

        {!isMulti && <ResponseView state={single.state} wordCounter={exercise.wordCounter} />}
        {isMulti && <CaseResults cases={exercise.cases!} states={multi.states} />}

        {graded && (graded.prompt.length > 0 || graded.response.length > 0 || isMulti) && (
          <div className={`rounded-xl border p-4 ${graded.pass ? "border-success/40 bg-success-soft" : "border-danger/30 bg-danger-soft/60"}`} role="status">
            <p className={`mb-2 flex items-center gap-2 font-semibold ${graded.pass ? "text-success" : "text-danger"}`}>
              {graded.pass ? <Trophy className="size-4" aria-hidden /> : <CircleX className="size-4" aria-hidden />}
              {graded.pass ? "Solved, nice work!" : "Not quite yet. Here's what the checker looked for:"}
            </p>
            <Checklist results={[...graded.prompt, ...graded.response]} />
            {isMulti && (
              <p className="mt-2 text-sm text-muted">
                {multi.states.filter((s) => s.pass).length} of {exercise.cases!.length} inputs passed.
              </p>
            )}
            {!graded.pass && <p className="mt-2 text-sm text-muted">Tweak your prompt and run it again. Answers vary a little each run, too.</p>}
          </div>
        )}

        {isRubric && single.state.status === "done" && (
          <RubricCheck exercise={exercise} spec={spec} response={single.state.text} solved={solved} onSolved={succeed} />
        )}

        {(justSolved || (solved && graded?.pass)) && exercise.takeaway && (
          <div className="flex gap-3 rounded-xl border border-success/30 bg-surface-2 px-4 py-3">
            <PartyPopper className="mt-1 size-4 shrink-0 text-success" aria-hidden />
            <Markdown className="prose-lesson prose-sm">{exercise.takeaway}</Markdown>
          </div>
        )}

        <HintLadder hints={exercise.hints} solution={exercise.solution} onUseSolution={(s) => setSpec(s)} />
      </div>
    </section>
  );
}

// ---------- Multi-case running ----------

function useMultiCase(cases: TestCase[] | undefined) {
  const [states, setStates] = useState<CaseState[]>([]);
  const ctrlRef = useRef<AbortController | null>(null);
  const running = states.some((s) => s.status === "running" || s.status === "pending");

  const runAll = useCallback(
    async (spec: PromptSpec): Promise<boolean[] | null> => {
      if (!cases) return null;
      ctrlRef.current?.abort();
      const ctrl = new AbortController();
      ctrlRef.current = ctrl;
      const { apiKey, model } = getAppState();
      setStates(cases.map(() => ({ status: "pending", text: "" })));
      const update = (i: number, patch: Partial<CaseState>) =>
        setStates((prev) => prev.map((s, j) => (j === i ? { ...s, ...patch } : s)));

      // Run up to 3 at a time to stay friendly with rate limits.
      const passes: boolean[] = new Array(cases.length).fill(false);
      let next = 0;
      let aborted = false;
      const worker = async () => {
        while (next < cases.length && !ctrl.signal.aborted) {
          const i = next++;
          const c = cases[i];
          update(i, { status: "running" });
          try {
            const r = await runPrompt(
              { ...spec, variables: { ...spec.variables, ...c.variables } },
              { apiKey, modelId: model, signal: ctrl.signal, onText: (text) => update(i, { text }) },
            );
            const results = grade(r.text, c.criteria);
            passes[i] = allPass(results);
            update(i, { status: "done", text: r.text, results, pass: passes[i] });
          } catch (e) {
            if (isAbort(e) || ctrl.signal.aborted) {
              aborted = true;
              update(i, { status: "error", error: { title: "Stopped", detail: "" } });
            } else update(i, { status: "error", error: friendlyError(e), pass: false });
          }
        }
      };
      await Promise.all([worker(), worker(), worker()]);
      if (aborted || ctrl.signal.aborted) {
        setStates((prev) => prev.map((s) => (s.status === "pending" ? { ...s, status: "error", error: { title: "Stopped", detail: "" } } : s)));
        return null;
      }
      return passes;
    },
    [cases],
  );

  const stop = useCallback(() => ctrlRef.current?.abort(), []);
  const reset = useCallback(() => {
    ctrlRef.current?.abort();
    setStates([]);
  }, []);
  return { states, runAll, stop, reset, running };
}

function CaseResults({ cases, states }: { cases: TestCase[]; states: CaseState[] }) {
  if (!states.length) return null;
  return (
    <ol className="space-y-2.5" aria-live="polite">
      {cases.map((c, i) => (
        <CaseRow key={i} index={i} testCase={c} state={states[i]} />
      ))}
    </ol>
  );
}

function CaseRow({ index, testCase, state }: { index: number; testCase: TestCase; state?: CaseState }) {
  const [open, setOpen] = useState(false);
  const input = Object.values(testCase.variables).join("\n");
  const long = (state?.text.length ?? 0) > 220;
  return (
    <li className="rounded-xl border border-line bg-surface-2/50">
      <div className="flex flex-wrap items-center gap-2 px-3.5 py-2.5">
        {state?.status === "running" || state?.status === "pending" ? (
          <LoaderCircle className="size-4 animate-spin text-muted" aria-label="Running" />
        ) : state?.pass ? (
          <CircleCheck className="size-4 text-success" aria-label="Passed" />
        ) : (
          <CircleX className="size-4 text-danger" aria-label="Did not pass" />
        )}
        <span className="text-sm font-semibold">
          {index + 1}. {testCase.label}
        </span>
        <span className="text-xs text-muted">
          expected: <span className="font-medium text-ink">{testCase.expected}</span>
        </span>
      </div>
      <details className="group border-t border-line px-3.5 py-2 text-sm">
        <summary className="flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-muted hover:text-ink">
          <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" aria-hidden /> Show the input
        </summary>
        <p className="mt-1.5 whitespace-pre-wrap break-words font-mono text-[0.8rem] text-muted">{input}</p>
      </details>
      {state && (state.text || state.error) && (
        <div className="border-t border-line px-3.5 py-2.5">
          {state.error && state.error.title !== "Stopped" ? (
            <p className="text-sm text-danger">
              {state.error.title}. <span className="text-muted">{state.error.detail}</span>
            </p>
          ) : state.error ? (
            <p className="text-sm text-muted">Stopped.</p>
          ) : (
            <>
              <div className={`whitespace-pre-wrap break-words font-mono text-[0.82rem] leading-relaxed ${long && !open ? "line-clamp-4" : ""}`}>
                {highlightTags(state.text)}
              </div>
              {long && (
                <button type="button" className="mt-1 text-xs font-medium text-accent" onClick={() => setOpen((o) => !o)}>
                  {open ? "Show less" : "Show full answer"}
                </button>
              )}
              {state.results && !state.pass && (
                <div className="mt-2">
                  <Checklist results={state.results} />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </li>
  );
}

// ---------- Open-ended exercises ----------

function RubricCheck({
  exercise,
  spec,
  response,
  solved,
  onSolved,
}: {
  exercise: Exercise;
  spec: PromptSpec;
  response: string;
  solved: boolean;
  onSolved: () => void;
}) {
  const rubric = exercise.rubric!;
  const [checked, setChecked] = useState<boolean[]>(() => rubric.map(() => false));
  const feedback = useRunner();
  const all = checked.every(Boolean);

  const reviewSpec = useMemo<PromptSpec>(
    () => ({
      system: "You are a friendly, encouraging prompt-engineering tutor reviewing a beginner's prompt. Be specific and kind, and never rewrite the whole prompt for them.",
      user: [
        "Here is the rubric for this exercise:",
        "<rubric>",
        ...rubric.map((r) => `- ${r}`),
        "</rubric>",
        "",
        "Here is the learner's prompt:",
        "<learner_prompt>",
        spec.system?.trim() ? `SYSTEM PROMPT:\n${spec.system}\n` : "",
        `USER MESSAGE:\n${spec.user}`,
        "</learner_prompt>",
        "",
        "Here is the response Claude gave to that prompt:",
        "<response>",
        response,
        "</response>",
        "",
        "For each rubric item, write ✅ or ❌ and one short sentence about the prompt. Then give the single most useful suggestion for improving it. Keep the whole review under 150 words. Use plain text, no markdown headings.",
      ].join("\n"),
    }),
    [rubric, spec, response],
  );

  return (
    <div className="space-y-3 rounded-xl border border-line bg-surface-2/50 p-4">
      <p className="font-semibold">Check your own work</p>
      <p className="text-sm text-muted">There's no single right answer here. Tick each box once your prompt does it.</p>
      <ul className="space-y-2">
        {rubric.map((r, i) => (
          <li key={i}>
            <label className="flex cursor-pointer items-start gap-2.5 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 size-4 accent-[var(--accent)]"
                checked={checked[i]}
                onChange={(e) => setChecked((c) => c.map((v, j) => (j === i ? e.target.checked : v)))}
              />
              <span>{r}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btn.secondary} disabled={feedback.state.status === "running"} onClick={() => void feedback.run(reviewSpec)}>
          <MessageSquare className="size-4" aria-hidden /> Get feedback from Claude
        </button>
        {!solved && (
          <button type="button" className={btn.primary} disabled={!all} onClick={onSolved}>
            <CircleCheck className="size-4" aria-hidden /> Mark as solved
          </button>
        )}
      </div>
      <ResponseView state={feedback.state} label="Tutor feedback" compact />
    </div>
  );
}
