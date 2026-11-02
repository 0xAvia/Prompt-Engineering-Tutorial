import { CircleCheck, FlaskConical, GraduationCap, KeyRound, Settings } from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { chapterStats, chapters, levels } from "../content/course";
import { useAppState } from "../lib/storage";
import { openKeyDialog } from "../lib/ui";
import { site } from "../site";
import { KeyDialog } from "./KeyDialog";

export function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only z-50 rounded-lg bg-accent px-3 py-2 text-on-accent focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <KeyDialog />
    </div>
  );
}

function Header() {
  const { apiKey } = useAppState();
  const navCls = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
      isActive ? "bg-surface-2 text-ink" : "text-muted hover:text-ink"
    }`;
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4 sm:px-6">
        <Link to="/" className="mr-2 flex items-center gap-2 font-semibold tracking-tight">
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="size-7" />
          <span className="hidden sm:inline">{site.name}</span>
        </Link>
        <nav className="flex items-center gap-1" aria-label="Main">
          <NavLink to="/" end className={navCls}>
            <GraduationCap className="size-4" aria-hidden /> Course
          </NavLink>
          <NavLink to="/playground" className={navCls}>
            <FlaskConical className="size-4" aria-hidden /> Playground
          </NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={openKeyDialog}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
              apiKey ? "border-success/40 bg-success-soft text-success" : "border-warning/40 bg-warning-soft text-warning hover:border-warning"
            }`}
            title={apiKey ? "API key added. Click to change it." : "No API key yet: you're in demo mode. Click to add one."}
          >
            {apiKey ? <CircleCheck className="size-3.5" aria-hidden /> : <KeyRound className="size-3.5" aria-hidden />}
            {apiKey ? "Key added" : "Demo mode"}
          </button>
          <NavLink to="/settings" className={navCls} aria-label="Settings">
            <Settings className="size-4" aria-hidden />
          </NavLink>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-muted sm:px-6">
        <p>
          {site.name} is an unofficial, community-made course, not affiliated with or endorsed by Anthropic. Its exercises are adapted from Anthropic's open{" "}
          <a className="text-accent underline underline-offset-2" href={site.original} target="_blank" rel="noreferrer noopener">
            Prompt Engineering Interactive Tutorial
          </a>
          , rewritten for beginners and updated for current Claude models.{" "}
          <a className="text-accent underline underline-offset-2" href={site.repo} target="_blank" rel="noreferrer noopener">
            Source on GitHub
          </a>
          .
        </p>
      </div>
    </footer>
  );
}

/** Course outline with progress, used in the chapter sidebar. */
export function CourseNav({ currentId, onNavigate }: { currentId?: string; onNavigate?: () => void }) {
  const { progress } = useAppState();
  return (
    <nav aria-label="Course chapters" className="space-y-5">
      {levels.map((lvl) => {
        const list = chapters.filter((c) => c.level === lvl.id);
        if (!list.length) return null;
        return (
          <div key={lvl.id}>
            <p className="mb-1.5 px-2 text-[0.7rem] font-bold uppercase tracking-wider text-faint">{lvl.title}</p>
            <ul className="space-y-0.5">
              {list.map((c) => {
                const s = chapterStats(c, progress);
                const current = c.id === currentId;
                return (
                  <li key={c.id}>
                    <Link
                      to={`/learn/${c.id}`}
                      onClick={onNavigate}
                      aria-current={current ? "page" : undefined}
                      className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors ${
                        current ? "bg-accent-soft font-semibold text-ink" : "text-muted hover:bg-surface-2 hover:text-ink"
                      }`}
                    >
                      <StatusDot complete={s.complete} started={s.started} current={current} />
                      <span className="w-7 shrink-0 font-mono text-xs text-faint">{c.number}</span>
                      <span className="min-w-0 truncate">{c.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function StatusDot({ complete, started, current }: { complete: boolean; started: boolean; current: boolean }) {
  if (complete) return <CircleCheck className="size-4 shrink-0 text-success" aria-label="Complete" />;
  return (
    <span
      className={`size-4 shrink-0 rounded-full border-2 ${current ? "border-accent" : started ? "border-accent/50" : "border-line-strong"}`}
      aria-label={started ? "Started" : "Not started"}
    />
  );
}
