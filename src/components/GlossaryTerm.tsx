import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { glossary } from "../content/glossary";

/** A dotted-underlined term that opens a short definition on click or hover. */
export function GlossaryTerm({ id, children }: { id: string; children: ReactNode }) {
  const entry = glossary[id];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const popRef = useRef<HTMLSpanElement>(null);
  const [shift, setShift] = useState(0);
  const popId = useId();

  // Keep the popover on screen: on a phone, a term near the right edge would push it off.
  useLayoutEffect(() => {
    if (!open || !popRef.current) return setShift(0);
    const margin = 8;
    const r = popRef.current.getBoundingClientRect();
    const base = r.left - shift;
    const maxLeft = window.innerWidth - margin - r.width;
    setShift(Math.max(margin, Math.min(base, maxLeft)) - base);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!entry) return <>{children}</>;

  return (
    <span ref={ref} className="relative inline">
      <button
        type="button"
        aria-expanded={open}
        aria-describedby={open ? popId : undefined}
        onClick={() => setOpen((o) => !o)}
        className="cursor-help border-b border-dotted border-muted text-inherit decoration-0 hover:border-accent hover:text-accent"
      >
        {children}
      </button>
      {open && (
        <span
          id={popId}
          ref={popRef}
          role="tooltip"
          style={{ transform: `translateX(${shift}px)` }}
          className="absolute left-0 top-full z-30 mt-2 block w-72 max-w-[80vw] rounded-xl border border-line bg-surface p-3 text-left text-sm leading-relaxed text-ink shadow-card"
        >
          <span className="mb-1 block font-semibold">{entry.term}</span>
          <span className="block text-muted">{entry.definition}</span>
        </span>
      )}
    </span>
  );
}
