import { describe, expect, it } from "vitest";
import { chapterExercises, chapters } from "../src/content/course";
import type { Block, Example, PromptSpec } from "../src/content/types";
import { resolveRequest, validateRequest } from "../src/lib/claude";
import { grade } from "../src/lib/graders";
import { findVariables } from "../src/lib/template";

const templateText = (s: PromptSpec) => [s.system ?? "", ...(s.history ?? []).map((t) => t.content), s.user].join("\n");

function examplesIn(blocks: Block[]): Example[] {
  return blocks.flatMap((b) => (b.kind === "playground" ? [b.example] : b.kind === "compare" ? [b.before, b.after] : []));
}

const allBlocks = chapters.flatMap((c) => c.sections.flatMap((s) => s.blocks));

describe("course content", () => {
  it("has unique chapter ids and numbers", () => {
    expect(new Set(chapters.map((c) => c.id)).size).toBe(chapters.length);
    expect(new Set(chapters.map((c) => c.number)).size).toBe(chapters.length);
  });

  it("has unique example ids (they key the recorded demo answers)", () => {
    const ids = examplesIn(allBlocks).map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unique exercise ids", () => {
    const ids = chapters.flatMap(chapterExercises).map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every chapter has goals and a quiz with valid answers", () => {
    for (const c of chapters) {
      expect(c.goals.length, c.id).toBeGreaterThan(0);
      for (const q of c.quiz) {
        expect(q.answer, `${c.id}: ${q.q}`).toBeGreaterThanOrEqual(0);
        expect(q.answer, `${c.id}: ${q.q}`).toBeLessThan(q.options.length);
      }
    }
  });

  it("every example is a valid request with all its variables filled", () => {
    for (const ex of examplesIn(allBlocks)) {
      const p = ex.prompt;
      const vars = findVariables(p.system, p.user, ...(p.history ?? []).map((t) => t.content));
      for (const v of vars) expect(p.variables?.[v], `${ex.id} is missing {${v}}`).toBeDefined();
      if (p.user.trim()) expect(validateRequest(resolveRequest(p, "claude-haiku-5-5")), ex.id).toBeNull();
    }
  });

  for (const ex of chapters.flatMap(chapterExercises)) {
    describe(`exercise ${ex.id}`, () => {
      it("has hints and a way to be graded", () => {
        expect(ex.hints.length).toBeGreaterThan(0);
        expect(!!(ex.criteria?.length || ex.cases?.length || ex.rubric?.length)).toBe(true);
      });

      if (ex.solution) {
        it("sample solution passes the prompt checks", () => {
          const results = grade(templateText(ex.solution!), ex.promptCriteria ?? []);
          expect(results.filter((r) => !r.pass).map((r) => r.label)).toEqual([]);
          expect(validateRequest(resolveRequest(ex.solution!, "claude-haiku-5-5"))).toBeNull();
        });

        it("sample solution only edits allowed fields", () => {
          if (!ex.editable.includes("system")) expect(ex.solution!.system ?? "").toBe(ex.start.system ?? "");
          if (!ex.editable.includes("user")) expect(ex.solution!.user).toBe(ex.start.user);
          if (!ex.editable.includes("variables")) expect(ex.solution!.variables ?? {}).toEqual(ex.start.variables ?? {});
        });
      }
    });
  }
});
