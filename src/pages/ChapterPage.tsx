import { ArrowLeft, ArrowRight, CircleCheck, Clock, Menu, Target, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Callout } from "../components/Callout";
import { CustomBlock } from "../components/custom";
import { ExerciseCard } from "../components/ExerciseCard";
import { CourseNav } from "../components/Layout";
import { Markdown } from "../components/Markdown";
import { Compare, PromptPlayground } from "../components/PromptPlayground";
import { Quiz } from "../components/Quiz";
import { chapterStats, getChapter, levels, neighbours } from "../content/course";
import type { Block } from "../content/types";
import { markVisited, useAppState } from "../lib/storage";
import { site } from "../site";

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case "text":
      return <Markdown>{block.md}</Markdown>;
    case "callout":
      return <Callout tone={block.tone} title={block.title} md={block.md} />;
    case "playground":
      return <PromptPlayground example={block.example} />;
    case "compare":
      return <Compare title={block.title} before={block.before} after={block.after} takeaway={block.takeaway} />;
    case "exercise":
      return <ExerciseCard exercise={block.exercise} />;
    case "custom":
      return <CustomBlock component={block.component} />;
  }
}

export function ChapterPage() {
  const { chapterId } = useParams();
  const chapter = getChapter(chapterId);
  const { progress } = useAppState();
  const [navOpen, setNavOpen] = useState(false);
  const drawerRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (chapter) {
      markVisited(chapter.id);
      document.title = `${chapter.number}. ${chapter.title} · ${site.name}`;
    }
  }, [chapter]);

  useEffect(() => {
    const d = drawerRef.current;
    if (!d) return;
    if (navOpen && !d.open) d.showModal();
    if (!navOpen && d.open) d.close();
  }, [navOpen]);

  if (!chapter) return <Navigate to="/" replace />;
  const stats = chapterStats(chapter, progress);
  const { prev, next } = neighbours(chapter.id);
  const level = levels.find((l) => l.id === chapter.level)!;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-10">
      <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] overflow-y-auto py-8 pr-2 lg:block">
        <CourseNav currentId={chapter.id} />
      </aside>

      <dialog
        ref={drawerRef}
        onClose={() => setNavOpen(false)}
        onClick={(e) => e.target === drawerRef.current && setNavOpen(false)}
        className="m-0 h-dvh max-h-dvh w-[min(20rem,85vw)] border-r border-line bg-bg p-0 text-ink backdrop:bg-black/40"
        aria-label="Chapters"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <span className="font-semibold">Chapters</span>
          <button type="button" className="rounded-lg p-1.5 hover:bg-surface-2" onClick={() => setNavOpen(false)} aria-label="Close chapter list">
            <X className="size-5" />
          </button>
        </div>
        <div className="p-3">
          <CourseNav currentId={chapter.id} onNavigate={() => setNavOpen(false)} />
        </div>
      </dialog>

      <article className="min-w-0 max-w-[54rem] py-6 sm:py-8">
        <button
          type="button"
          onClick={() => setNavOpen(true)}
          className="mb-5 inline-flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-muted hover:text-ink lg:hidden"
        >
          <Menu className="size-4" aria-hidden /> All chapters
        </button>

        <header className="mb-8">
          <p className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span className="font-semibold text-accent">
              {chapter.level === "appendix" ? "Appendix" : "Chapter"} {chapter.number}
            </span>
            <span>{level.title}</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden /> ~{chapter.minutes} min
            </span>
            {stats.exercises > 0 && (
              <span className={`inline-flex items-center gap-1 ${stats.solved === stats.exercises ? "text-success" : ""}`}>
                <CircleCheck className="size-3.5" aria-hidden /> {stats.solved}/{stats.exercises} exercises
              </span>
            )}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">{chapter.title}</h1>
          <p className="mt-3 text-lg text-muted text-pretty">{chapter.summary}</p>
          <div className="mt-5 rounded-2xl border border-line bg-surface p-4 sm:p-5">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Target className="size-4 text-accent" aria-hidden /> By the end of this chapter you'll be able to:
            </p>
            <ul className="space-y-1 pl-6 text-[0.95rem] text-muted">
              {chapter.goals.map((g, i) => (
                <li key={i} className="list-disc">
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </header>

        <div className="space-y-12">
          {chapter.sections.map((s) => (
            <section key={s.id} id={s.id} aria-labelledby={`h-${s.id}`} className="scroll-mt-20">
              <h2 id={`h-${s.id}`} className="mb-4 text-2xl font-bold tracking-tight">
                {s.title}
              </h2>
              <div className="space-y-6">
                {s.blocks.map((b, i) => (
                  <BlockView key={i} block={b} />
                ))}
              </div>
            </section>
          ))}

          {chapter.quiz.length > 0 && <Quiz chapterId={chapter.id} questions={chapter.quiz} />}
        </div>

        <nav className="mt-12 grid gap-3 border-t border-line pt-6 sm:grid-cols-2" aria-label="Chapter navigation">
          {prev ? (
            <Link to={`/learn/${prev.id}`} className="group rounded-2xl border border-line p-4 hover:border-accent">
              <span className="flex items-center gap-1 text-xs text-muted">
                <ArrowLeft className="size-3.5" aria-hidden /> Previous
              </span>
              <span className="mt-1 block font-semibold group-hover:text-accent">
                {prev.number}. {prev.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link to={`/learn/${next.id}`} className="group rounded-2xl border border-line p-4 text-right hover:border-accent sm:col-start-2">
              <span className="flex items-center justify-end gap-1 text-xs text-muted">
                Next <ArrowRight className="size-3.5" aria-hidden />
              </span>
              <span className="mt-1 block font-semibold group-hover:text-accent">
                {next.number}. {next.title}
              </span>
            </Link>
          ) : (
            <Link to="/playground" className="group rounded-2xl border border-accent/40 bg-accent-soft p-4 text-right sm:col-start-2">
              <span className="text-xs text-muted">You've reached the end!</span>
              <span className="mt-1 block font-semibold group-hover:text-accent">Keep practising in the Playground →</span>
            </Link>
          )}
        </nav>
      </article>
    </div>
  );
}
