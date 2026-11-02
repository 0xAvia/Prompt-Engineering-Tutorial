import { CircleCheck, CircleX, GraduationCap, RotateCcw } from "lucide-react";
import { useState } from "react";
import type { QuizQuestion } from "../content/types";
import { recordQuiz } from "../lib/storage";
import { btn } from "../lib/ui";
import { Markdown } from "./Markdown";

export function Quiz({ chapterId, questions }: { chapterId: string; questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const done = answers.every((a) => a !== null);
  const correct = answers.filter((a, i) => a === questions[i].answer).length;

  const choose = (qi: number, oi: number) => {
    if (answers[qi] !== null) return;
    const next = answers.map((a, i) => (i === qi ? oi : a));
    setAnswers(next);
    if (next.every((a) => a !== null)) {
      recordQuiz(chapterId, next.filter((a, i) => a === questions[i].answer).length, questions.length);
    }
  };

  return (
    <section className="rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-6" aria-labelledby={`quiz-${chapterId}`}>
      <div className="mb-4 flex items-center gap-2">
        <GraduationCap className="size-5 text-accent" aria-hidden />
        <h3 id={`quiz-${chapterId}`} className="text-lg font-semibold">
          Quick check
        </h3>
        <span className="text-sm text-muted">· no API key needed</span>
      </div>
      <ol className="space-y-6">
        {questions.map((q, qi) => {
          const picked = answers[qi];
          return (
            <li key={qi}>
              <div className="mb-2 font-medium">
                <Markdown className="prose-lesson">{`${qi + 1}. ${q.q}`}</Markdown>
              </div>
              <div className="grid gap-2" role="radiogroup" aria-label={`Question ${qi + 1}`}>
                {q.options.map((opt, oi) => {
                  const isPicked = picked === oi;
                  const isRight = q.answer === oi;
                  const state = picked === null ? "idle" : isRight ? "right" : isPicked ? "wrong" : "dim";
                  return (
                    <button
                      key={oi}
                      type="button"
                      role="radio"
                      aria-checked={isPicked}
                      disabled={picked !== null}
                      onClick={() => choose(qi, oi)}
                      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-[0.95rem] transition-colors ${
                        state === "idle"
                          ? "border-line-strong hover:border-accent hover:bg-accent-soft/40"
                          : state === "right"
                            ? "border-success/50 bg-success-soft"
                            : state === "wrong"
                              ? "border-danger/50 bg-danger-soft"
                              : "border-line opacity-60"
                      }`}
                    >
                      {state === "right" ? (
                        <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                      ) : state === "wrong" ? (
                        <CircleX className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
                      ) : (
                        <span className="mt-0.5 size-4 shrink-0 rounded-full border-2 border-line-strong" aria-hidden />
                      )}
                      <span className="min-w-0">{opt}</span>
                    </button>
                  );
                })}
              </div>
              {picked !== null && (
                <p className={`mt-2 text-sm ${picked === q.answer ? "text-success" : "text-muted"}`}>
                  <strong>{picked === q.answer ? "Correct. " : "Not quite. "}</strong>
                  <span className="text-muted">{q.explain}</span>
                </p>
              )}
            </li>
          );
        })}
      </ol>
      {done && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl bg-surface-2 px-4 py-3">
          <p className="font-semibold">
            You got {correct} of {questions.length}
            {correct === questions.length ? ". Perfect!" : "."}
          </p>
          <button type="button" className={`${btn.ghost} ml-auto`} onClick={() => setAnswers(questions.map(() => null))}>
            <RotateCcw className="size-4" aria-hidden /> Try again
          </button>
        </div>
      )}
    </section>
  );
}
