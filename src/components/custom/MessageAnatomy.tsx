import { Bot, ScrollText, Sparkles, User } from "lucide-react";
import { useState } from "react";

const parts = [
  {
    key: "system",
    label: "System prompt",
    icon: ScrollText,
    text: "You are a friendly travel guide. Keep answers under 50 words.",
    cls: "border-dashed border-tag/50 bg-tag-bg/50",
    chip: "bg-tag-bg text-tag",
    explain:
      "Optional. Ground rules that apply to the whole conversation: a role to play, a tone, things to always or never do. It sits above the turns, not inside them.",
  },
  {
    key: "user1",
    label: "User",
    icon: User,
    text: "What's one thing I must see in Lisbon?",
    cls: "border-line-strong bg-surface",
    chip: "bg-surface-3 text-ink",
    explain: "Your message. A conversation always starts with a user turn.",
  },
  {
    key: "assistant1",
    label: "Assistant (Claude)",
    icon: Bot,
    text: "The Belém Tower: a 16th-century fortress on the river, especially lovely at sunset.",
    cls: "border-accent/40 bg-accent-soft/50",
    chip: "bg-accent-soft text-accent",
    explain:
      "An earlier reply from Claude. You can include earlier replies to continue a conversation, or even write them yourself to set up a situation.",
  },
  {
    key: "user2",
    label: "User",
    icon: User,
    text: "Is it close to the city centre?",
    cls: "border-line-strong bg-surface",
    chip: "bg-surface-3 text-ink",
    explain: "The newest message. Turns alternate: user, assistant, user… and the last one is yours.",
  },
] as const;

export function MessageAnatomy() {
  const [active, setActive] = useState<string>("system");
  const [showCode, setShowCode] = useState(false);
  const current = parts.find((p) => p.key === active)!;

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
      <div className="grid gap-5 md:grid-cols-[1fr_15rem]">
        <ol className="space-y-2" aria-label="Parts of a request">
          {parts.map((p) => {
            const Icon = p.icon;
            const isActive = p.key === active;
            return (
              <li key={p.key} className={p.key.startsWith("assistant") ? "pl-6" : p.key === "system" ? "" : "pr-6"}>
                <button
                  type="button"
                  onClick={() => setActive(p.key)}
                  aria-pressed={isActive}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-left transition-shadow ${p.cls} ${isActive ? "ring-2 ring-accent" : "hover:ring-1 hover:ring-line-strong"}`}
                >
                  <span className={`mb-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide ${p.chip}`}>
                    <Icon className="size-3" aria-hidden /> {p.label}
                  </span>
                  <span className="block text-sm">{p.text}</span>
                </button>
              </li>
            );
          })}
          <li className="pl-6">
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-accent/40 px-3.5 py-2.5 text-sm text-muted">
              <Sparkles className="size-4 text-accent" aria-hidden /> Claude writes the next assistant turn…
            </div>
          </li>
        </ol>
        <div className="rounded-xl bg-surface-2 p-4 md:self-start" aria-live="polite">
          <p className="text-sm font-semibold">{current.label}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">{current.explain}</p>
        </div>
      </div>
      <button type="button" onClick={() => setShowCode((s) => !s)} className="mt-4 text-sm font-medium text-accent hover:underline" aria-expanded={showCode}>
        {showCode ? "Hide" : "Show"} what this looks like to the API
      </button>
      {showCode && (
        <pre tabIndex={0} aria-label="The request as JSON" className="mt-2 overflow-x-auto rounded-xl border border-line bg-surface-2 p-3.5 font-mono text-[0.78rem] leading-relaxed">
          {`{
  "model": "claude-haiku-5-5",
  "max_tokens": 1000,
  "system": "You are a friendly travel guide. Keep answers under 50 words.",
  "messages": [
    { "role": "user", "content": "What's one thing I must see in Lisbon?" },
    { "role": "assistant", "content": "The Belém Tower: a 16th-century fortress…" },
    { "role": "user", "content": "Is it close to the city centre?" }
  ]
}`}
        </pre>
      )}
    </div>
  );
}
