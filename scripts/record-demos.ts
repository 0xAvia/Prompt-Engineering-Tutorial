/**
 * Records real Claude answers for every lesson example, for demo mode.
 *
 *   ANTHROPIC_API_KEY=sk-ant-... npm run record-demos            # record new or changed examples
 *   ANTHROPIC_API_KEY=sk-ant-... npm run record-demos -- --force # re-record everything
 *   npm run record-demos -- --dry-run                            # list what would be recorded (no key needed)
 *
 * Answers are keyed by example id plus a hash of the prompt, so editing a lesson
 * prompt automatically invalidates its old recording.
 */
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { BUILDER_DEFAULT_SPEC } from "../src/content/builder";
import { chapters } from "../src/content/course";
import type { Example, PromptSpec } from "../src/content/types";
import { resolveRequest, toParams } from "../src/lib/claude";
import type { DemoEntry } from "../src/lib/demo";
import { promptHash } from "../src/lib/hash";
import { DEFAULT_MODEL } from "../src/lib/models";

const OUT = fileURLToPath(new URL("../src/content/demo-responses.json", import.meta.url));
const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const force = args.has("--force");

function collect(): { id: string; spec: PromptSpec }[] {
  const items: { id: string; spec: PromptSpec }[] = [];
  const add = (e: Example) => e.prompt.user.trim() && items.push({ id: e.id, spec: e.prompt });
  for (const ch of chapters)
    for (const s of ch.sections)
      for (const b of s.blocks) {
        if (b.kind === "playground") add(b.example);
        if (b.kind === "compare") (add(b.before), add(b.after));
      }
  items.push({ id: "9-builder", spec: BUILDER_DEFAULT_SPEC });
  return items;
}

async function main() {
  const existing = JSON.parse(readFileSync(OUT, "utf8")) as Record<string, DemoEntry>;
  const items = collect();
  const todo = items.filter((it) => force || existing[it.id]?.hash !== promptHash(it.spec));
  console.log(`${items.length} examples, ${todo.length} to record${dryRun ? " (dry run)" : ""}.`);
  if (dryRun) {
    for (const it of todo) console.log(`  ${it.id}`);
    return;
  }
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("Set ANTHROPIC_API_KEY to record demo answers.");

  const client = new Anthropic();
  const out: Record<string, DemoEntry> = { ...existing };
  let next = 0;
  let failed = 0;
  const worker = async () => {
    while (next < todo.length) {
      const it = todo[next++];
      try {
        const msg = await client.messages.create({ ...toParams(resolveRequest(it.spec, DEFAULT_MODEL)), stream: false });
        if (msg.stop_reason === "refusal") throw new Error("refused");
        let text = "";
        let thinking = "";
        for (const block of msg.content) {
          if (block.type === "text") text += block.text;
          else if (block.type === "thinking") thinking += block.thinking;
        }
        out[it.id] = { hash: promptHash(it.spec), text, ...(thinking ? { thinking } : {}), model: msg.model, recordedAt: new Date().toISOString().slice(0, 10) };
        console.log(`  ✓ ${it.id}`);
      } catch (e) {
        failed++;
        console.error(`  ✗ ${it.id}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);

  // Drop recordings for examples that no longer exist.
  const ids = new Set(items.map((i) => i.id));
  const sorted = Object.fromEntries(Object.entries(out).filter(([id]) => ids.has(id)).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(OUT, JSON.stringify(sorted, null, 2) + "\n");
  console.log(`Saved ${Object.keys(sorted).length} recordings to src/content/demo-responses.json${failed ? ` (${failed} failed)` : ""}.`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
