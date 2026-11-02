import { Info, Lightbulb, RefreshCw, TriangleAlert } from "lucide-react";
import { Markdown } from "./Markdown";

const tones = {
  tip: { icon: Lightbulb, cls: "bg-accent-soft border-accent/30", iconCls: "text-accent", label: "Tip" },
  note: { icon: Info, cls: "bg-info-soft border-info/30", iconCls: "text-info", label: "Note" },
  warning: { icon: TriangleAlert, cls: "bg-warning-soft border-warning/30", iconCls: "text-warning", label: "Heads up" },
  changed: { icon: RefreshCw, cls: "bg-tag-bg border-tag/30", iconCls: "text-tag", label: "What changed since the original tutorial" },
} as const;

export function Callout({ tone, title, md }: { tone: keyof typeof tones; title?: string; md: string }) {
  const t = tones[tone];
  const Icon = t.icon;
  return (
    <aside className={`flex gap-3 rounded-2xl border p-4 sm:p-5 ${t.cls}`}>
      <Icon className={`mt-0.5 size-5 shrink-0 ${t.iconCls}`} aria-hidden />
      <div className="min-w-0">
        <p className="mb-1 font-semibold">{title ?? t.label}</p>
        <Markdown className="prose-lesson prose-sm">{md}</Markdown>
      </div>
    </aside>
  );
}
