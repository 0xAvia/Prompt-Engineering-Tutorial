import { FileText, KeyRound, Play, RotateCcw, Search, Square } from "lucide-react";
import { useMemo, useState } from "react";
import { RAG_DEFAULT_TEMPLATE, formatDocs, retrieve } from "../../content/retrieval";
import { useAppState } from "../../lib/storage";
import { btn, openKeyDialog } from "../../lib/ui";
import { useRunner } from "../../lib/useRunner";
import { PromptEditor } from "../PromptEditor";
import { ResponseView } from "../ResponseView";

const SUGGESTIONS = ["How long is the warranty on e-bike batteries?", "Is the Seattle store open on Mondays?", "How much is a flat tyre repair?", "Do you sell skateboards?"];

function StepLabel({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
      <span className="flex size-6 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">{n}</span>
      {children}
    </p>
  );
}

export function RetrievalSandbox() {
  const { apiKey } = useAppState();
  const [question, setQuestion] = useState(SUGGESTIONS[0]);
  const [template, setTemplate] = useState(RAG_DEFAULT_TEMPLATE);
  const hits = useMemo(() => retrieve(question), [question]);
  const { state, run, stop, reset } = useRunner();
  const running = state.status === "running";

  const onRun = () => {
    if (!apiKey) return openKeyDialog();
    void run({ user: template, variables: { DOCUMENTS: formatDocs(hits), QUESTION: question } });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      <header className="border-b border-line px-4 py-3 sm:px-5">
        <h4 className="font-semibold">Retrieval sandbox: Brightwater Bikes help centre</h4>
        <p className="text-sm text-muted">A made-up bike shop with eight help articles. Claude can't know these from training; it only knows what you retrieve.</p>
      </header>
      <div className="space-y-5 p-4 sm:p-5">
        <div>
          <StepLabel n={1}>A customer asks a question</StepLabel>
          <input
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value);
              reset();
            }}
            aria-label="Customer question"
            className="w-full rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setQuestion(s);
                  reset();
                }}
                className={`rounded-full border px-2.5 py-1 text-xs ${s === question ? "border-accent bg-accent-soft text-ink" : "border-line text-muted hover:border-accent hover:text-ink"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <StepLabel n={2}>
            <Search className="size-4 text-muted" aria-hidden /> Search finds the most relevant articles
          </StepLabel>
          {hits.length === 0 ? (
            <p className="rounded-xl bg-surface-2 px-3.5 py-2.5 text-sm text-muted">No articles match. Claude will get no documents at all.</p>
          ) : (
            <ol className="space-y-2">
              {hits.map((h) => (
                <li key={h.doc.id}>
                  <details className="group rounded-xl border border-line bg-surface-2/50 px-3.5 py-2.5">
                    <summary className="flex cursor-pointer list-none items-center gap-2 text-sm">
                      <FileText className="size-4 shrink-0 text-muted" aria-hidden />
                      <span className="font-medium">
                        [{h.doc.id}] {h.doc.title}
                      </span>
                      <span className="ml-auto shrink-0 font-mono text-xs text-faint" title="Keyword match score">
                        score {h.score}
                      </span>
                    </summary>
                    <p className="mt-2 text-sm text-muted">{h.doc.text}</p>
                  </details>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div>
          <StepLabel n={3}>The articles and question are put into your prompt</StepLabel>
          <div className="rounded-xl border border-line-strong bg-surface focus-within:border-accent">
            <PromptEditor label="Retrieval prompt template" value={template} onChange={setTemplate} />
          </div>
          {template !== RAG_DEFAULT_TEMPLATE && (
            <button type="button" className={`${btn.ghost} mt-1`} onClick={() => setTemplate(RAG_DEFAULT_TEMPLATE)}>
              <RotateCcw className="size-4" aria-hidden /> Reset template
            </button>
          )}
        </div>

        <div>
          <StepLabel n={4}>Claude answers from the documents</StepLabel>
          <div className="flex flex-wrap gap-2">
            {running ? (
              <button type="button" className={btn.secondary} onClick={stop}>
                <Square className="size-4 fill-current" aria-hidden /> Stop
              </button>
            ) : (
              <button type="button" className={btn.primary} onClick={onRun}>
                {apiKey ? <Play className="size-4 fill-current" aria-hidden /> : <KeyRound className="size-4" aria-hidden />}
                {apiKey ? "Ask Claude" : "Add API key to run"}
              </button>
            )}
          </div>
          <div className="mt-3">
            <ResponseView state={state} />
          </div>
        </div>
      </div>
    </div>
  );
}
