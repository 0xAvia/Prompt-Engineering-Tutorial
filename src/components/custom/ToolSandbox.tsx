import { ArrowDownLeft, CircleCheck, CircleX, KeyRound, LoaderCircle, Play, Square, Trophy, Wrench, X } from "lucide-react";
import { useRef, useState } from "react";
import { DB_SOLUTION, DB_TESTS, DB_TOOLS, buildDbTools, calculatorTool, initialDb, runCalculator, runDbTool } from "../../content/tools";
import { friendlyError, isAbort, type FriendlyError } from "../../lib/claude";
import { getAppState, markSolved, useAppState } from "../../lib/storage";
import { runToolLoop, type TraceStep } from "../../lib/tools";
import { btn, openKeyDialog } from "../../lib/ui";
import { Checklist } from "../Checklist";
import { HintLadder } from "../HintLadder";

function Trace({ steps, running }: { steps: TraceStep[]; running?: boolean }) {
  return (
    <ol className="space-y-2" aria-live="polite">
      {steps.map((s, i) => (
        <li key={i}>
          {s.kind === "text" && (
            <div className="rounded-xl border border-line bg-surface-2/60 px-3.5 py-2.5 text-sm">
              <span className="mb-0.5 block text-[0.7rem] font-bold uppercase tracking-wide text-accent">Claude</span>
              <span className="whitespace-pre-wrap break-words">{s.text}</span>
            </div>
          )}
          {s.kind === "call" && (
            <div className="rounded-xl border border-tag/30 bg-tag-bg/60 px-3.5 py-2.5 text-sm">
              <span className="mb-0.5 flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-wide text-tag">
                <Wrench className="size-3" aria-hidden /> Claude asks to use a tool
              </span>
              <code className="break-all font-mono text-[0.82rem]">
                {s.name}({JSON.stringify(s.input)})
              </code>
            </div>
          )}
          {s.kind === "result" && (
            <div className={`ml-4 rounded-xl border px-3.5 py-2.5 text-sm ${s.isError ? "border-danger/30 bg-danger-soft/60" : "border-line bg-surface"}`}>
              <span className="mb-0.5 flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-wide text-muted">
                <ArrowDownLeft className="size-3" aria-hidden /> {s.isError ? "Tool error, sent back to Claude" : "Your code runs it and sends back the result"}
              </span>
              <code className="break-all font-mono text-[0.82rem]">{s.content}</code>
            </div>
          )}
        </li>
      ))}
      {running && (
        <li className="flex items-center gap-2 text-sm text-muted">
          <LoaderCircle className="size-4 animate-spin" aria-hidden /> Waiting for Claude…
        </li>
      )}
    </ol>
  );
}

function ErrorBox({ error }: { error: FriendlyError }) {
  return (
    <p className="rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm" role="alert">
      <strong className="text-danger">{error.title}.</strong> <span className="text-muted">{error.detail}</span>
    </p>
  );
}

// ---------- Calculator demo ----------

export function CalculatorSandbox() {
  const { apiKey } = useAppState();
  const [request, setRequest] = useState("Multiply 1,984,135 by 9,343,116");
  const [steps, setSteps] = useState<TraceStep[]>([]);
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [error, setError] = useState<FriendlyError | null>(null);
  const ctrl = useRef<AbortController | null>(null);

  const run = async () => {
    if (!apiKey) return openKeyDialog();
    ctrl.current?.abort();
    ctrl.current = new AbortController();
    setSteps([]);
    setError(null);
    setStatus("running");
    try {
      const { model } = getAppState();
      await runToolLoop({
        apiKey,
        modelId: model,
        user: request,
        tools: [calculatorTool],
        execute: (_name, input) => runCalculator(input),
        signal: ctrl.current.signal,
        onStep: setSteps,
      });
      setStatus("done");
    } catch (e) {
      if (isAbort(e)) return setStatus("done");
      setError(friendlyError(e));
      setStatus("error");
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
      <div>
        <h3 className="font-semibold">Claude + a calculator tool</h3>
        <p className="text-sm text-muted">
          Claude gets one tool, <code className="font-mono">calculator</code>. Ask for some arithmetic and watch it decide to use the tool. The
          calculation itself runs right here in your browser.
        </p>
      </div>
      <details className="rounded-xl border border-line bg-surface-2/60 px-3.5 py-2.5 text-sm">
        <summary className="cursor-pointer font-medium">See the tool definition Claude receives</summary>
        <pre tabIndex={0} aria-label="Calculator tool definition" className="mt-2 overflow-x-auto font-mono text-[0.78rem] leading-relaxed">{JSON.stringify(calculatorTool, null, 2)}</pre>
      </details>
      <label className="block">
        <span className="mb-1.5 block text-[0.8rem] font-semibold uppercase tracking-wide text-muted">Your message</span>
        <input
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && status !== "running" && void run()}
          className="w-full rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 font-mono text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        {status === "running" ? (
          <button type="button" className={btn.secondary} onClick={() => ctrl.current?.abort()}>
            <Square className="size-4 fill-current" aria-hidden /> Stop
          </button>
        ) : (
          <button type="button" className={btn.primary} onClick={run} disabled={!request.trim()}>
            {apiKey ? <Play className="size-4 fill-current" aria-hidden /> : <KeyRound className="size-4" aria-hidden />}
            {apiKey ? "Run" : "Add API key to run"}
          </button>
        )}
        {status !== "running" && steps.length > 0 && (
          <button
            type="button"
            className={btn.ghost}
            onClick={() => {
              setSteps([]);
              setError(null);
              setStatus("idle");
            }}
          >
            <X className="size-4" aria-hidden /> Clear
          </button>
        )}
        <span className="self-center text-xs text-faint">Try: “What's 15% of 2,340?” or “What's the capital of France?” (no tool needed)</span>
      </div>
      {(steps.length > 0 || status === "running") && <Trace steps={steps} running={status === "running"} />}
      {error && <ErrorBox error={error} />}
    </div>
  );
}

// ---------- Database exercise ----------

interface TestState {
  status: "pending" | "running" | "done" | "error";
  steps: TraceStep[];
  pass?: boolean;
  checks?: { label: string; pass: boolean }[];
  error?: FriendlyError;
}

export function DatabaseExercise() {
  const { apiKey, progress } = useAppState();
  const solved = !!progress.solved["10.2.1"];
  const [descriptions, setDescriptions] = useState<Record<string, string>>(() => Object.fromEntries(DB_TOOLS.map((t) => [t.name, ""])));
  const [tests, setTests] = useState<TestState[]>([]);
  const ctrl = useRef<AbortController | null>(null);
  const running = tests.some((t) => t.status === "running" || t.status === "pending");
  const done = tests.length > 0 && !running;
  const passCount = tests.filter((t) => t.pass).length;

  const run = async () => {
    if (!apiKey) return openKeyDialog();
    ctrl.current?.abort();
    const c = new AbortController();
    ctrl.current = c;
    const { model } = getAppState();
    const tools = buildDbTools(descriptions);
    setTests(DB_TESTS.map(() => ({ status: "pending", steps: [] })));
    const update = (i: number, patch: Partial<TestState>) => setTests((prev) => prev.map((t, j) => (j === i ? { ...t, ...patch } : t)));

    const results = await Promise.all(
      DB_TESTS.map(async (test, i) => {
        const db = initialDb();
        update(i, { status: "running" });
        try {
          const r = await runToolLoop({
            apiKey,
            modelId: model,
            system: "You can read and write a small database using the tools provided.",
            user: test.request,
            tools,
            execute: (name, input) => runDbTool(db, name, input),
            signal: c.signal,
            onStep: (steps) => update(i, { steps }),
          });
          const calls = r.trace.filter((s): s is Extract<TraceStep, { kind: "call" }> => s.kind === "call");
          const checks = [{ label: test.expectLabel, pass: calls.some((s) => s.name === test.expectTool && test.inputOk(s.input)) }];
          if (test.answerIncludes)
            checks.push({ label: `Final answer mentions ${test.answerIncludes}`, pass: r.finalText.toLowerCase().includes(test.answerIncludes.toLowerCase()) });
          const pass = checks.every((x) => x.pass);
          update(i, { status: "done", steps: r.trace, checks, pass });
          return pass;
        } catch (e) {
          update(i, { status: "error", error: isAbort(e) ? { title: "Stopped", detail: "" } : friendlyError(e), pass: false });
          return false;
        }
      }),
    );
    if (!c.signal.aborted && results.every(Boolean)) markSolved("10.2.1");
  };

  return (
    <section className={`overflow-hidden rounded-2xl border-2 bg-surface shadow-card ${solved ? "border-success/40" : "border-accent/30"}`} aria-labelledby="ex-10.2.1">
      <header className="flex flex-wrap items-center gap-2 border-b border-line bg-accent-soft/50 px-4 py-3 sm:px-5">
        <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-on-accent">Exercise 10.2.1</span>
        <h3 id="ex-10.2.1" className="font-semibold">
          The world's smallest database
        </h3>
        {solved && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success">
            <CircleCheck className="size-3.5" aria-hidden /> Solved
          </span>
        )}
      </header>
      <div className="space-y-4 p-4 sm:p-5">
        <div className="prose-lesson">
          <p>
            A developer gave Claude four database tools, but named them <code>fn_a</code> to <code>fn_d</code> with parameters called{" "}
            <code>x</code> and <code>y</code>. You can't rename them, but you <strong>can write their descriptions</strong>. Write a description
            for each tool so Claude can handle the four test requests below.
          </p>
        </div>

        <details className="rounded-xl border border-line bg-surface-2/60 px-3.5 py-2.5 text-sm">
          <summary className="cursor-pointer font-medium">What's in the database (the tools secretly do this)</summary>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-faint">users</p>
              {initialDb().users.map((u) => (
                <p key={u.id} className="font-mono text-[0.8rem]">
                  {u.id} · {u.name} · {u.email}
                </p>
              ))}
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-faint">products</p>
              {initialDb().products.map((p) => (
                <p key={p.id} className="font-mono text-[0.8rem]">
                  {p.id} · {p.name} · ${p.price}
                </p>
              ))}
            </div>
          </div>
          <p className="mt-2 text-xs text-muted">fn_a gets a user by ID · fn_b gets a product by ID · fn_c adds a user (name, email) · fn_d adds a product (name, price)</p>
        </details>

        <div className="grid gap-3 md:grid-cols-2">
          {DB_TOOLS.map((t) => (
            <label key={t.name} className="block rounded-xl border border-line-strong p-3 focus-within:border-accent">
              <span className="mb-1.5 block font-mono text-sm font-semibold">
                {t.name}({t.params.map((p) => `${p.name}: ${p.type}`).join(", ")})
              </span>
              <textarea
                value={descriptions[t.name]}
                rows={3}
                placeholder="Describe what this tool does and what each parameter means…"
                onChange={(e) => setDescriptions((d) => ({ ...d, [t.name]: e.target.value }))}
                className="block w-full resize-y rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:outline-none"
              />
            </label>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {running ? (
            <button type="button" className={btn.secondary} onClick={() => ctrl.current?.abort()}>
              <Square className="size-4 fill-current" aria-hidden /> Stop
            </button>
          ) : (
            <button type="button" className={btn.primary} onClick={run}>
              {apiKey ? <Play className="size-4 fill-current" aria-hidden /> : <KeyRound className="size-4" aria-hidden />}
              {apiKey ? "Run the 4 test requests & check" : "Add API key to try this"}
            </button>
          )}
        </div>

        {tests.length > 0 && (
          <ol className="space-y-3">
            {DB_TESTS.map((test, i) => {
              const s = tests[i];
              return (
                <li key={i} className="rounded-xl border border-line bg-surface-2/40 p-3.5">
                  <p className="mb-2 flex items-start gap-2 text-sm font-semibold">
                    {s.status === "running" || s.status === "pending" ? (
                      <LoaderCircle className="mt-0.5 size-4 shrink-0 animate-spin text-muted" aria-label="Running" />
                    ) : s.pass ? (
                      <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" aria-label="Passed" />
                    ) : (
                      <CircleX className="mt-0.5 size-4 shrink-0 text-danger" aria-label="Did not pass" />
                    )}
                    “{test.request}”
                  </p>
                  <Trace steps={s.steps} />
                  {s.error && s.error.title !== "Stopped" && <ErrorBox error={s.error} />}
                  {s.checks && (
                    <div className="mt-2">
                      <Checklist results={s.checks} />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}

        {done && (
          <div className={`rounded-xl border p-4 ${passCount === DB_TESTS.length ? "border-success/40 bg-success-soft" : "border-danger/30 bg-danger-soft/60"}`} role="status">
            <p className={`flex items-center gap-2 font-semibold ${passCount === DB_TESTS.length ? "text-success" : "text-danger"}`}>
              {passCount === DB_TESTS.length ? <Trophy className="size-4" aria-hidden /> : <CircleX className="size-4" aria-hidden />}
              {passCount === DB_TESTS.length ? "All four requests handled. Solved!" : `${passCount} of ${DB_TESTS.length} requests handled correctly.`}
            </p>
            {passCount === DB_TESTS.length && (
              <p className="mt-1 text-sm text-muted">Tool descriptions are prompts too. Clear ones are how Claude knows which tool to pick and what to pass it.</p>
            )}
          </div>
        )}

        <HintLadder
          hints={[
            "Start each description with what the tool *does*, e.g. “Looks up a user by their ID.”",
            "Explain the parameters, since their names don't help: “x = the user's ID (a number)”, “y = the user's email address”.",
            "Say what to do when information is missing, e.g. “use an empty string if no email is given”.",
          ]}
        />
        <details className="text-sm">
          <summary className="cursor-pointer font-medium text-muted hover:text-ink">Show sample descriptions</summary>
          <div className="mt-2 space-y-1.5 rounded-xl border border-tag/30 bg-tag-bg/60 p-3.5">
            {Object.entries(DB_SOLUTION).map(([k, v]) => (
              <p key={k}>
                <code className="font-mono font-semibold">{k}</code>: {v}
              </p>
            ))}
            <button type="button" className={`${btn.secondary} mt-2 !py-1.5`} onClick={() => setDescriptions(DB_SOLUTION)}>
              Copy into the editor
            </button>
          </div>
        </details>
      </div>
    </section>
  );
}
