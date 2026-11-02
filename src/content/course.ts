import type { Chapter, Exercise, Level } from "./types";
import type { Progress } from "../lib/storage";
import { ch01 } from "./chapters/01-basic-prompt-structure";

export const chapters: Chapter[] = [ch01];

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
