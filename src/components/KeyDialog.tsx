import { Eye, EyeOff, KeyRound, LoaderCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { friendlyError, makeClient } from "../lib/claude";
import { clearApiKey, getAppState, saveApiKey, useAppState } from "../lib/storage";
import { btn, closeKeyDialog, useKeyDialogOpen } from "../lib/ui";

export function KeyDialog() {
  const open = useKeyDialogOpen();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={closeKeyDialog}
      onClick={(e) => e.target === ref.current && closeKeyDialog()}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-2xl border border-line bg-surface p-0 text-ink shadow-card backdrop:bg-black/40 backdrop:backdrop-blur-sm"
      aria-labelledby="key-dialog-title"
    >
      {open && <KeyForm onDone={closeKeyDialog} />}
    </dialog>
  );
}

export function KeyForm({ onDone, inline }: { onDone?: () => void; inline?: boolean }) {
  const { apiKey, rememberKey, model } = useAppState();
  const [value, setValue] = useState(apiKey);
  const [remember, setRemember] = useState(apiKey ? rememberKey : true);
  const [reveal, setReveal] = useState(false);
  const [status, setStatus] = useState<{ kind: "idle" | "testing" | "ok" | "error"; msg?: string }>({ kind: "idle" });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const k = value.trim();
    if (!k) return;
    setStatus({ kind: "testing" });
    try {
      // Looking up a model is free and confirms the key works.
      await makeClient(k).models.retrieve(model);
      saveApiKey(k, remember);
      setStatus({ kind: "ok", msg: "Key works. You're all set!" });
      if (onDone) setTimeout(onDone, 700);
    } catch (err) {
      const f = friendlyError(err);
      if (f.keyProblem || f.title.startsWith("Model")) {
        setStatus({ kind: "error", msg: `${f.title}. ${f.detail}` });
      } else {
        // Couldn't verify (network etc.). Save anyway so the learner isn't blocked.
        saveApiKey(k, remember);
        setStatus({ kind: "ok", msg: "Saved. We couldn't verify it right now, but you can try running a prompt." });
        if (onDone) setTimeout(onDone, 1200);
      }
    }
  };

  return (
    <form onSubmit={save} className={inline ? "" : "p-5 sm:p-6"}>
      {!inline && (
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-xl bg-accent-soft p-2.5">
            <KeyRound className="size-5 text-accent" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="key-dialog-title" className="text-lg font-semibold">
              Your Anthropic API key
            </h2>
            <p className="text-sm text-muted">Lets this page send your prompts to Claude.</p>
          </div>
          <button type="button" onClick={onDone} className="rounded-lg p-1.5 text-muted hover:bg-surface-2" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
      )}

      <label htmlFor="api-key" className="mb-1.5 block text-sm font-medium">
        API key
      </label>
      <div className="flex gap-2">
        <input
          id="api-key"
          type={reveal ? "text" : "password"}
          autoComplete="off"
          spellCheck={false}
          placeholder="sk-ant-…"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setStatus({ kind: "idle" });
          }}
          className="min-w-0 flex-1 rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 font-mono text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
        <button type="button" className={btn.secondary} onClick={() => setReveal((r) => !r)} aria-label={reveal ? "Hide key" : "Show key"}>
          {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {value.trim() && !value.trim().startsWith("sk-ant-") && (
        <p className="mt-1.5 text-xs text-warning">Anthropic keys usually start with “sk-ant-”. Double-check you copied the whole key.</p>
      )}

      <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-sm">
        <input type="checkbox" className="mt-0.5 size-4 accent-[var(--accent)]" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
        <span>
          Remember on this device
          <span className="block text-xs text-muted">
            {remember ? "Stays in this browser until you remove it. Don't use this on a shared computer." : "Forgotten when you close this tab."}
          </span>
        </span>
      </label>

      <div className="mt-4 rounded-xl bg-surface-2 px-3.5 py-3 text-xs leading-relaxed text-muted">
        Your key is stored only in this browser and is sent only to Anthropic's API, never to us. Tip: create a separate key just for this course
        and set a low spend limit in the Claude Console. Usage is billed to your Anthropic account, but on Claude Haiku 5.5 the whole course
        costs a few cents.
      </div>

      {status.kind === "error" && <p className="mt-3 text-sm text-danger" role="alert">{status.msg}</p>}
      {status.kind === "ok" && <p className="mt-3 text-sm text-success" role="status">{status.msg}</p>}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button type="submit" className={btn.primary} disabled={!value.trim() || status.kind === "testing"}>
          {status.kind === "testing" && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          {status.kind === "testing" ? "Checking…" : "Save key"}
        </button>
        {getAppState().apiKey && (
          <button
            type="button"
            className={btn.ghost}
            onClick={() => {
              clearApiKey();
              setValue("");
              setStatus({ kind: "idle" });
            }}
          >
            Remove key
          </button>
        )}
        {!inline && (
          <Link to="/setup" onClick={onDone} className="ml-auto text-sm font-medium text-accent hover:underline">
            How do I get a key?
          </Link>
        )}
      </div>
    </form>
  );
}
