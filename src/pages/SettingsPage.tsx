import { CircleCheck, KeyRound, Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { MODELS } from "../lib/models";
import { resetProgress, setModel, setTheme, useAppState, type Theme } from "../lib/storage";
import { btn, openKeyDialog } from "../lib/ui";
import { site } from "../site";

function Card({ title, children, desc }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      {desc && <p className="mt-1 text-sm text-muted">{desc}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function SettingsPage() {
  const { model, theme, apiKey, rememberKey } = useAppState();
  const [confirmReset, setConfirmReset] = useState(false);
  useEffect(() => {
    document.title = `Settings · ${site.name}`;
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <Card title="Model" desc="Which Claude model runs your prompts. Prices are per million tokens (about 750,000 words).">
        <div className="grid gap-2.5" role="radiogroup" aria-label="Model">
          {MODELS.map((m) => {
            const active = m.id === model;
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setModel(m.id)}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                  active ? "border-accent bg-accent-soft/60" : "border-line-strong hover:border-accent"
                }`}
              >
                <span className={`mt-1 size-4 shrink-0 rounded-full border-2 ${active ? "border-[5px] border-accent" : "border-line-strong"}`} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-semibold">{m.name}</span>
                    {m.id === "claude-haiku-5-5" && <span className="text-xs font-semibold text-accent">Recommended</span>}
                  </span>
                  <span className="block text-sm text-muted">{m.blurb}</span>
                </span>
                <span className="shrink-0 text-right text-xs text-muted">
                  ${m.inputPrice} in
                  <br />${m.outputPrice} out
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted">
          The exercises were tuned on Haiku 5.5. Bigger models usually pass them too, but may answer differently from what a lesson describes.
        </p>
      </Card>

      <Card title="API key">
        <div className="flex flex-wrap items-center gap-3">
          {apiKey ? (
            <p className="flex items-center gap-2 text-sm">
              <CircleCheck className="size-4 text-success" aria-hidden />
              Key saved <span className="font-mono text-muted">…{apiKey.slice(-4)}</span>
              <span className="text-muted">({rememberKey ? "remembered on this device" : "this tab only"})</span>
            </p>
          ) : (
            <p className="text-sm text-muted">No key yet: you're in demo mode.</p>
          )}
          <button type="button" className={`${btn.secondary} ml-auto`} onClick={openKeyDialog}>
            <KeyRound className="size-4" aria-hidden /> {apiKey ? "Change or remove" : "Add a key"}
          </button>
        </div>
      </Card>

      <Card title="Appearance">
        <div className="inline-flex rounded-xl border border-line-strong p-1" role="radiogroup" aria-label="Theme">
          {(
            [
              ["system", "System", Monitor],
              ["light", "Light", Sun],
              ["dark", "Dark", Moon],
            ] as [Theme, string, typeof Sun][]
          ).map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={theme === value}
              onClick={() => setTheme(value)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${
                theme === value ? "bg-accent text-on-accent" : "text-muted hover:text-ink"
              }`}
            >
              <Icon className="size-4" aria-hidden /> {label}
            </button>
          ))}
        </div>
      </Card>

      <Card title="Progress" desc="Your solved exercises and quiz scores are saved in this browser only.">
        {confirmReset ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm">Erase all progress? This can't be undone.</span>
            <button
              type="button"
              className={`${btn.secondary} !border-danger/50 !text-danger`}
              onClick={() => {
                resetProgress();
                setConfirmReset(false);
              }}
            >
              Yes, reset
            </button>
            <button type="button" className={btn.ghost} onClick={() => setConfirmReset(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button type="button" className={btn.secondary} onClick={() => setConfirmReset(true)}>
            Reset progress
          </button>
        )}
      </Card>
    </div>
  );
}
