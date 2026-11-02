import { useRouteError } from "react-router-dom";
import { site } from "../site";

/** Shown if something crashes, instead of a blank page. */
export function ErrorPage() {
  const error = useRouteError();
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-3 text-muted">This page hit an unexpected error. Your progress is saved. Try going back to the course.</p>
      <a href="#/" className="mt-6 inline-block rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent">
        Back to {site.name}
      </a>
      <details className="mt-8 text-left text-xs text-faint">
        <summary className="cursor-pointer">Technical details</summary>
        <pre className="mt-2 whitespace-pre-wrap">{message}</pre>
      </details>
    </div>
  );
}
