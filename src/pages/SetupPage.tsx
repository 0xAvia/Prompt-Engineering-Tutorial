import { ArrowRight, CircleCheck, ExternalLink } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { KeyForm } from "../components/KeyDialog";
import { chapters } from "../content/course";
import { acknowledgeDemo, useAppState } from "../lib/storage";
import { btn } from "../lib/ui";
import { site } from "../site";

const steps = [
  {
    title: "Create an Anthropic account",
    body: (
      <>
        Go to the{" "}
        <a href={site.console} target="_blank" rel="noreferrer noopener" className="font-medium text-accent underline underline-offset-2">
          Claude Console <ExternalLink className="inline size-3.5" aria-hidden />
        </a>{" "}
        and sign up. This is Anthropic's site for developers. It's separate from a claude.ai chat subscription.
      </>
    ),
  },
  {
    title: "Add a little credit",
    body: (
      <>
        Under{" "}
        <a href={site.consoleBilling} target="_blank" rel="noreferrer noopener" className="font-medium text-accent underline underline-offset-2">
          Billing
        </a>
        , add the minimum amount of credit. On Claude Haiku 5.5 this whole course costs only a few cents, so the minimum goes a long way. You can
        also set a monthly spend limit to stay safe.
        <span className="mt-3 block rounded-xl border border-accent/30 bg-accent-soft/60 px-3.5 py-2.5 text-ink">
          <strong>Have a Claude Max or Ultra plan?</strong> It comes with free monthly API credits: <strong>$100 on Max</strong> and{" "}
          <strong>$200 on Ultra</strong>, so you can skip buying credit. On claude.ai, go to <strong>Settings → Billing</strong> and, under{" "}
          <strong>API credits</strong>, link your Console organization. Credits refresh every billing cycle and don't roll over.{" "}
          <a href={site.apiCredits} target="_blank" rel="noreferrer noopener" className="font-medium text-accent underline underline-offset-2">
            Details
          </a>
        </span>
      </>
    ),
  },
  {
    title: "Create an API key",
    body: (
      <>
        Open{" "}
        <a href={site.consoleKeys} target="_blank" rel="noreferrer noopener" className="font-medium text-accent underline underline-offset-2">
          API keys
        </a>{" "}
        and click <strong>Create key</strong>. Name it something like “prompt-school” so you know what it's for. Copy it straight away; it's shown
        only once.
      </>
    ),
  },
  {
    title: "Paste it below",
    body: <>The key is saved only in this browser and sent only to Anthropic. You can remove it any time in Settings.</>,
  },
];

export function SetupPage() {
  const { apiKey } = useAppState();
  useEffect(() => {
    document.title = `Set up your API key · ${site.name}`;
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Set up your API key</h1>
      <p className="mt-3 text-lg text-muted">
        An <strong className="text-ink">API key</strong> is a secret password that lets this page send your prompts to Claude. Setting one up takes about
        two minutes.
      </p>

      <ol className="mt-8 space-y-4">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft font-bold text-accent">{i + 1}</span>
            <div className="min-w-0">
              <h2 className="font-semibold">{s.title}</h2>
              <p className="mt-1 text-[0.95rem] leading-relaxed text-muted">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 rounded-2xl border-2 border-accent/30 bg-surface p-5 sm:p-6">
        {apiKey && (
          <p className="mb-4 flex items-center gap-2 font-semibold text-success">
            <CircleCheck className="size-5" aria-hidden /> You have a key saved. You're ready to go.
          </p>
        )}
        <KeyForm inline />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link to={`/learn/${chapters[0].id}`} className={btn.primary}>
          {apiKey ? "Start learning" : "Continue without a key (demo mode)"} <ArrowRight className="size-4" aria-hidden />
        </Link>
        {!apiKey && (
          <p className="text-sm text-muted" onClick={acknowledgeDemo}>
            In demo mode you can read every lesson, see recorded answers and take the quizzes. You'll need a key to run your own prompts.
          </p>
        )}
      </div>
    </div>
  );
}
