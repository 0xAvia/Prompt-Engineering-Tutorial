/**
 * Live-checks the course against the real API.
 *
 *   ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/live-check.ts            # full run
 *   npx tsx scripts/live-check.ts --dry-run                               # offline checks only (no key needed)
 *   ... --samples 3  --only 5.1,10.2.1  --skip-compare  --out live-check-report.md
 *
 * - Every exercise with a sample `solution`: checks it against `promptCriteria`, then
 *   runs it N times (per test case for multi-input exercises) and grades each answer.
 * - Exercise 10.2.1: runs the tool loop with the sample descriptions against DB_TESTS.
 * - Every `compare` block: runs both sides once and writes both answers to the report,
 *   flagging pairs where "before" already passes a simple heuristic as well as "after".
 *
 * Uses the course's own request builder (resolveRequest + toParams), so each example's
 * effort, schema and max_tokens are exactly what learners send. No retries.
 */
import Anthropic from "@anthropic-ai/sdk";
import { writeFileSync } from "node:fs";
import { chapters } from "../src/content/course";
import { DB_SOLUTION, DB_TESTS, buildDbTools, initialDb, runDbTool } from "../src/content/tools";
import type { Criterion, Example, Exercise, PromptSpec } from "../src/content/types";
import { resolveRequest, toParams, validateRequest } from "../src/lib/claude";
import { allPass, grade } from "../src/lib/graders";
import { DEFAULT_MODEL } from "../src/lib/models";
import { runToolLoop, type TraceStep } from "../src/lib/tools";

const argv = process.argv.slice(2);
const flag = (name: string) => argv.includes(name);
const opt = (name: string) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};
const dryRun = flag("--dry-run");
const skipCompare = flag("--skip-compare");
const SAMPLES = Number(opt("--samples") ?? 3);
const only = opt("--only")?.split(",").map((s) => s.trim());
const OUT = opt("--out") ?? "live-check-report.md";
const MODEL = DEFAULT_MODEL;

const apiKey = process.env.ANTHROPIC_API_KEY ?? "";
const client = dryRun ? null : new Anthropic({ apiKey, maxRetries: 0 });

/** Same text the exercise card grades with promptCriteria. */
const templateText = (spec: PromptSpec) => [spec.system ?? "", ...(spec.history ?? []).map((t) => t.content), spec.user].join("\n");

let inTok = 0;
let outTok = 0;

async function send(spec: PromptSpec): Promise<{ text: string; stop: string | null; error?: string }> {
  const req = resolveRequest(spec, MODEL);
  const problem = validateRequest(req);
  if (problem) return { text: "", stop: null, error: `invalid request: ${problem}` };
  try {
    const msg = await client!.messages.create({ ...toParams(req), stream: false });
    inTok += msg.usage.input_tokens;
    outTok += msg.usage.output_tokens;
    const text = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    return { text, stop: msg.stop_reason };
  } catch (e) {
    return { text: "", stop: null, error: e instanceof Error ? e.message : String(e) };
  }
}

/** Run tasks with a small concurrency limit. */
async function pool<T>(tasks: (() => Promise<T>)[], n = 4): Promise<T[]> {
  const out: T[] = new Array(tasks.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (next < tasks.length) {
        const i = next++;
        out[i] = await tasks[i]();
      }
    }),
  );
  return out;
}

const fence = (s: string) => "```text\n" + s.replace(/```/g, "ʼʼʼ").trim() + "\n```";
const failed = (crit: Criterion[], text: string) => grade(text, crit).filter((r) => !r.pass).map((r) => r.label);

interface Sample {
  pass: boolean;
  text: string;
  failedLabels: string[];
  stop: string | null;
  error?: string;
}
interface ExerciseRow {
  id: string;
  title: string;
  promptOk: boolean;
  promptFailed: string[];
  runs: { label: string; samples: Sample[] }[];
}

function collect() {
  const exercises: { chapter: string; ex: Exercise }[] = [];
  const compares: { chapter: string; title?: string; before: Example; after: Example; labels?: [string, string]; takeaway?: string }[] = [];
  for (const ch of chapters)
    for (const s of ch.sections)
      for (const b of s.blocks) {
        if (b.kind === "exercise") exercises.push({ chapter: ch.number, ex: b.exercise });
        if (b.kind === "compare") compares.push({ chapter: ch.number, title: b.title, before: b.before, after: b.after, labels: b.labels, takeaway: b.takeaway });
      }
  return { exercises, compares };
}

async function checkExercise(ex: Exercise): Promise<ExerciseRow> {
  const sol = ex.solution!;
  const pf = failed(ex.promptCriteria ?? [], templateText(sol));
  const row: ExerciseRow = { id: ex.id, title: ex.title, promptOk: pf.length === 0, promptFailed: pf, runs: [] };
  const targets = ex.cases?.length
    ? ex.cases.map((c) => ({ label: c.label, spec: { ...sol, variables: { ...sol.variables, ...c.variables } }, criteria: c.criteria }))
    : [{ label: "(single)", spec: sol, criteria: ex.criteria ?? [] }];
  if (dryRun) {
    row.runs = targets.map((t) => ({ label: t.label, samples: [] }));
    return row;
  }
  const tasks = targets.flatMap((t, ti) =>
    Array.from({ length: SAMPLES }, () => async () => {
      const r = await send(t.spec);
      const fl = r.error ? ["API error"] : failed(t.criteria, r.text);
      // Rubric-only exercises have no response criteria: a non-empty answer counts as a run, not a grade.
      const pass = !r.error && (t.criteria.length ? fl.length === 0 && allPass(grade(r.text, t.criteria)) : r.text.trim().length > 0);
      return { ti, s: { pass, text: r.text, failedLabels: fl, stop: r.stop, error: r.error } as Sample };
    }),
  );
  const res = await pool(tasks);
  row.runs = targets.map((t, ti) => ({ label: t.label, samples: res.filter((r) => r.ti === ti).map((r) => r.s) }));
  return row;
}

async function checkTools() {
  const tools = buildDbTools(DB_SOLUTION);
  const tasks = DB_TESTS.flatMap((test) =>
    Array.from({ length: SAMPLES }, () => async () => {
      const db = initialDb();
      try {
        const r = await runToolLoop({
          apiKey,
          modelId: MODEL,
          system: "You can read and write a small database using the tools provided.",
          user: test.request,
          tools,
          execute: (name, input) => runDbTool(db, name, input),
        });
        inTok += r.inputTokens;
        outTok += r.outputTokens;
        const calls = r.trace.filter((s): s is Extract<TraceStep, { kind: "call" }> => s.kind === "call");
        const callOk = calls.some((s) => s.name === test.expectTool && test.inputOk(s.input));
        const ansOk = !test.answerIncludes || r.finalText.toLowerCase().includes(test.answerIncludes.toLowerCase());
        return { request: test.request, pass: callOk && ansOk, detail: `${calls.map((c) => `${c.name}(${JSON.stringify(c.input)})`).join(", ") || "no tool call"} → ${r.finalText.trim().slice(0, 160)}` };
      } catch (e) {
        return { request: test.request, pass: false, detail: `error: ${e instanceof Error ? e.message : String(e)}` };
      }
    }),
  );
  return pool(tasks);
}

/**
 * Crude "is before already good?" signal: if both sides produce answers of similar length
 * and the before answer shares most of the after answer's distinctive words, a human should look.
 */
function similarity(a: string, b: string): number {
  const words = (s: string) => new Set(s.toLowerCase().match(/[a-z]{4,}/g) ?? []);
  const A = words(a);
  const B = words(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  return inter / Math.min(A.size, B.size);
}

async function main() {
  const { exercises: allEx, compares } = collect();
  const withSol = allEx.filter((e) => e.ex.solution && (!only || only.includes(e.ex.id)));
  const noSol = allEx.filter((e) => !e.ex.solution).map((e) => e.ex.id);
  console.log(`${allEx.length} exercises (${withSol.length} with solutions to check; no solution: ${noSol.join(", ") || "none"}), ${compares.length} compare blocks.`);
  if (!dryRun && !apiKey) throw new Error("Set ANTHROPIC_API_KEY (or pass --dry-run).");

  const lines: string[] = [`# Live check (${MODEL}, ${SAMPLES} samples per run)`, "", `Generated ${new Date().toISOString().slice(0, 10)}${dryRun ? " (dry run: offline checks only)" : ""}.`, ""];

  // ---- Exercises ----
  lines.push("## Exercises", "", "| Exercise | Prompt criteria | Pass rate | Notes |", "|---|---|---|---|");
  const detail: string[] = [];
  let totalPass = 0;
  let totalRuns = 0;
  for (const { ex } of withSol) {
    const row = await checkExercise(ex);
    const samples = row.runs.flatMap((r) => r.samples);
    const p = samples.filter((s) => s.pass).length;
    totalPass += p;
    totalRuns += samples.length;
    const perCase = row.runs.length > 1 ? row.runs.map((r) => `${r.label}: ${r.samples.filter((s) => s.pass).length}/${r.samples.length}`).join("; ") : "";
    const rubricOnly = !ex.criteria?.length && !ex.cases?.length;
    lines.push(`| ${ex.id} ${ex.title} | ${row.promptOk ? "ok" : `**FAIL**: ${row.promptFailed.join("; ")}`} | ${dryRun ? "-" : `${p}/${samples.length}`} | ${[rubricOnly ? "rubric only (self-graded)" : "", perCase].filter(Boolean).join(" ")} |`);
    console.log(`  ${ex.id}: prompt ${row.promptOk ? "ok" : "FAIL " + row.promptFailed.join("; ")}${dryRun ? "" : `, ${p}/${samples.length}`}`);
    const bad = row.runs.flatMap((r) => r.samples.filter((s) => !s.pass).map((s) => ({ label: r.label, s })));
    if (bad.length) {
      detail.push(`### ${ex.id} ${ex.title}`, "");
      for (const { label, s } of bad)
        detail.push(`- **${label}**: failed ${s.error ? `(${s.error})` : s.failedLabels.join("; ")}${s.stop && s.stop !== "end_turn" ? ` [stop: ${s.stop}]` : ""}`, "", fence(s.text || "(empty)"), "");
    }
  }
  if (!dryRun) lines.push("", `**Overall:** ${totalPass}/${totalRuns} sampled runs passed.`);

  // ---- Tool use ----
  if (!dryRun && (!only || only.includes("10.2.1"))) {
    const t = await checkTools();
    const p = t.filter((x) => x.pass).length;
    lines.push("", "## 10.2.1 Tool use (sample descriptions)", "", `Pass rate: ${p}/${t.length}`, "");
    for (const x of t) lines.push(`- ${x.pass ? "✓" : "✗"} ${x.request}: ${x.detail.replace(/\n/g, " ")}`);
    console.log(`  10.2.1: ${p}/${t.length}`);
  }

  if (detail.length) lines.push("", "## Failed samples", "", ...detail);

  // ---- Compare blocks ----
  if (!dryRun && !skipCompare) {
    lines.push("", "## Before/after comparisons", "", "Each side was run once. ⚠ marks pairs where the two answers look alike (word-overlap ≥ 0.6 and length within 30%); a human should judge whether the lesson's point still shows.", "");
    const runs = await pool(compares.map((c) => async () => ({ c, before: await send(c.before.prompt), after: await send(c.after.prompt) })));
    for (const { c, before, after } of runs) {
      const sim = similarity(before.text, after.text);
      const lenRatio = Math.min(before.text.length, after.text.length) / Math.max(before.text.length, after.text.length, 1);
      const flag = !c.labels && sim >= 0.6 && lenRatio >= 0.7;
      const [lb, la] = c.labels ?? ["Before", "After"];
      lines.push(`### ${flag ? "⚠ " : ""}${c.chapter}: ${c.title ?? `${c.before.id} vs ${c.after.id}`}`, "", `\`${c.before.id}\` vs \`${c.after.id}\` · overlap ${sim.toFixed(2)} · length ratio ${lenRatio.toFixed(2)}`, "");
      if (c.takeaway) lines.push(`> Lesson says: ${c.takeaway.replace(/\n/g, " ")}`, "");
      lines.push(`**${lb}**`, "", fence(before.error ?? before.text), "", `**${la}**`, "", fence(after.error ?? after.text), "");
    }
    console.log(`  ${compares.length} compare pairs written.`);
  }

  if (!dryRun) lines.splice(3, 0, `Tokens used: ${inTok} in / ${outTok} out.`, "");
  writeFileSync(OUT, lines.join("\n") + "\n");
  console.log(`Report written to ${OUT}. Tokens: ${inTok} in / ${outTok} out.`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
