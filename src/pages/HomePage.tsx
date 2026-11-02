import { ArrowRight, BookOpen, CircleCheck, Clock, KeyRound, PencilLine, Trophy } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { chapterStats, chapters, courseStats, levels } from "../content/course";
import { useAppState } from "../lib/storage";
import { btn } from "../lib/ui";
import { site } from "../site";

export function HomePage() {
  const { progress, apiKey } = useAppState();
  const stats = courseStats(progress);
  const last = chapters.find((c) => c.id === progress.lastChapter);
  const started = stats.solved > 0 || !!last;

  useEffect(() => {
    document.title = `${site.name} · Learn prompt engineering, interactively`;
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.1fr_1fr] lg:py-20">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-muted">
              Free · Interactive · No coding needed
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              Write prompts that get Claude to do <span className="text-accent">exactly</span> what you want.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted text-pretty">
              A hands-on course for complete beginners. Short lessons, live examples you can edit and run, and exercises that check your work
              instantly. Based on Anthropic's prompt engineering tutorial, rebuilt as an interactive page.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {started && last ? (
                <Link to={`/learn/${last.id}`} className={`${btn.primary} !px-5 !py-3 !text-base`}>
                  Continue: {last.number}. {last.title} <ArrowRight className="size-4" aria-hidden />
                </Link>
              ) : (
                <Link to={`/learn/${chapters[0].id}`} className={`${btn.primary} !px-5 !py-3 !text-base`}>
                  Start the course <ArrowRight className="size-4" aria-hidden />
                </Link>
              )}
              {!apiKey && (
                <Link to="/setup" className={`${btn.secondary} !px-5 !py-3 !text-base`}>
                  <KeyRound className="size-4" aria-hidden /> Set up your API key
                </Link>
              )}
            </div>
            {started && (
              <div className="mt-8 max-w-md">
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-medium">Your progress</span>
                  <span className="text-muted">
                    {stats.solved}/{stats.exercises} exercises · {stats.completed}/{stats.chapters} chapters
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-3" role="progressbar" aria-label="Exercises solved" aria-valuemin={0} aria-valuemax={stats.exercises} aria-valuenow={stats.solved}>
                  <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(stats.solved / Math.max(1, stats.exercises)) * 100}%` }} />
                </div>
              </div>
            )}
          </div>
          <HeroIllustration />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h2 className="mb-6 text-2xl font-bold tracking-tight">How it works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: BookOpen, title: "Read a short lesson", text: "Each chapter teaches one technique in plain English, with jargon explained as you go." },
            { icon: PencilLine, title: "Edit live prompts", text: "Every example is a playground. Change the prompt, run it, and see how Claude's answer changes." },
            { icon: Trophy, title: "Solve the exercises", text: "Write your own prompts to hit a goal. They're checked automatically, with hints if you get stuck." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-line bg-surface p-5">
              <Icon className="mb-3 size-6 text-accent" aria-hidden />
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-[0.95rem] text-muted">{text}</p>
            </div>
          ))}
        </div>
        {!apiKey && (
          <p className="mt-5 rounded-2xl border border-line bg-surface-2 px-5 py-4 text-[0.95rem] text-muted">
            <strong className="text-ink">What you need:</strong> an Anthropic API key to run prompts live. It takes two minutes to{" "}
            <Link to="/setup" className="font-medium text-accent underline underline-offset-2">
              set up
            </Link>
            , and on Claude Haiku 5.5 the whole course costs a few cents. No key yet? You can still read every lesson, see recorded answers and
            take the quizzes in demo mode.
          </p>
        )}
      </section>

      {/* Course map */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <h2 className="mb-6 text-2xl font-bold tracking-tight">The course</h2>
        <div className="space-y-10">
          {levels.map((lvl) => {
            const list = chapters.filter((c) => c.level === lvl.id);
            if (!list.length) return null;
            return (
              <div key={lvl.id}>
                <div className="mb-3">
                  <h3 className="text-lg font-semibold">{lvl.title}</h3>
                  <p className="text-sm text-muted">{lvl.blurb}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((c) => {
                    const s = chapterStats(c, progress);
                    return (
                      <Link
                        key={c.id}
                        to={`/learn/${c.id}`}
                        className="group flex flex-col rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-accent"
                      >
                        <div className="mb-2 flex items-center gap-2 text-xs text-muted">
                          <span className="font-mono font-semibold text-accent">{c.number}</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3" aria-hidden /> {c.minutes} min
                          </span>
                          {s.complete ? (
                            <span className="ml-auto inline-flex items-center gap-1 font-semibold text-success">
                              <CircleCheck className="size-3.5" aria-hidden /> Done
                            </span>
                          ) : (
                            s.exercises > 0 && (
                              <span className="ml-auto">
                                {s.solved}/{s.exercises} exercises
                              </span>
                            )
                          )}
                        </div>
                        <span className="font-semibold group-hover:text-accent">{c.title}</span>
                        <span className="mt-1 text-sm text-muted">{c.summary}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/** A static before/after mock that shows what the course is about. */
function HeroIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-lg" aria-hidden>
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
        <p className="mb-2 text-[0.7rem] font-bold uppercase tracking-wide text-danger">Before</p>
        <p className="rounded-lg bg-surface-2 px-3 py-2 font-mono text-sm">Write a haiku about robots.</p>
        <p className="mt-2 px-1 font-mono text-[0.8rem] leading-relaxed text-muted">
          Here's a haiku about robots: Metal hearts beating, / Circuits pulse with electric… I hope you enjoy this haiku! Let me know if you'd like
          another…
        </p>
      </div>
      <div className="relative -mt-3 ml-6 rounded-2xl border-2 border-accent/40 bg-surface p-4 shadow-card sm:ml-12">
        <p className="mb-2 text-[0.7rem] font-bold uppercase tracking-wide text-success">After</p>
        <p className="rounded-lg bg-surface-2 px-3 py-2 font-mono text-sm leading-relaxed">
          Write a haiku about robots. Put it in <span className="tok-tag">&lt;haiku&gt;</span> tags and skip the preamble.
        </p>
        <p className="mt-2 px-1 font-mono text-[0.8rem] leading-relaxed">
          <span className="tok-tag">&lt;haiku&gt;</span>
          <br />
          Steel hands, patient hum
          <br />
          learning the weight of a cup
          <br />
          morning light on bolts
          <br />
          <span className="tok-tag">&lt;/haiku&gt;</span>
        </p>
      </div>
      <p className="mt-3 text-center text-xs text-faint">Illustration. In the course you'll run prompts like these yourself.</p>
    </div>
  );
}
