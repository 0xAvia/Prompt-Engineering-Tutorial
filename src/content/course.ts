import type { Chapter, Exercise, Level } from "./types";
import type { Progress } from "../lib/storage";
import { ch01 } from "./chapters/01-basic-prompt-structure";
import { ch02 } from "./chapters/02-being-clear-and-direct";
import { ch03 } from "./chapters/03-assigning-roles";
import { ch04 } from "./chapters/04-separating-data";
import { ch05 } from "./chapters/05-formatting-output";
import { ch06 } from "./chapters/06-thinking-step-by-step";
import { ch07 } from "./chapters/07-few-shot-examples";
import { ch08 } from "./chapters/08-avoiding-hallucinations";
import { ch09 } from "./chapters/09-complex-prompts";

export const chapters: Chapter[] = [ch01, ch02, ch03, ch04, ch05, ch06, ch07, ch08, ch09];

export const levels: { id: Level; title: string; blurb: string }[] = [
  { id: "beginner", title: "Beginner", blurb: "How prompts are put together, and the habits that fix most problems." },
  { id: "intermediate", title: "Intermediate", blurb: "Templates, formatting, step-by-step thinking and examples." },
  { id: "advanced", title: "Advanced", blurb: "Keeping Claude honest and building real-world prompts from scratch." },
  { id: "appendix", title: "Beyond prompting", blurb: "Chaining prompts, tool use, retrieval and testing." },
];

export function getChapter(id: string | undefined): Chapter | undefined {
  return chapters.find((c) => c.id === id);
}

export function neighbours(id: string): { prev?: Chapter; next?: Chapter } {
  const i = chapters.findIndex((c) => c.id === id);
  return { prev: chapters[i - 1], next: chapters[i + 1] };
}

export function chapterExercises(ch: Chapter): Exercise[] {
  return ch.sections.flatMap((s) => s.blocks.flatMap((b) => (b.kind === "exercise" ? [b.exercise] : [])));
}

export interface ChapterStats {
  exercises: number;
  solved: number;
  quizDone: boolean;
  complete: boolean;
  started: boolean;
}

export function chapterStats(ch: Chapter, p: Progress): ChapterStats {
  const ex = chapterExercises(ch);
  const solved = ex.filter((e) => p.solved[e.id]).length;
  const quizDone = !!p.quiz[ch.id];
  return {
    exercises: ex.length,
    solved,
    quizDone,
    complete: solved === ex.length && (quizDone || ch.quiz.length === 0),
    started: !!p.visited[ch.id] || solved > 0,
  };
}

export function courseStats(p: Progress) {
  const all = chapters.map((c) => chapterStats(c, p));
  return {
    chapters: chapters.length,
    completed: all.filter((s) => s.complete).length,
    exercises: all.reduce((n, s) => n + s.exercises, 0),
    solved: all.reduce((n, s) => n + s.solved, 0),
  };
}
