import { CircleCheck, CircleX } from "lucide-react";
import type { GradeResult } from "../lib/graders";

export function Checklist({ results }: { results: GradeResult[] }) {
  return (
    <ul className="space-y-1.5">
      {results.map((r, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          {r.pass ? (
            <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" aria-label="Passed" />
          ) : (
            <CircleX className="mt-0.5 size-4 shrink-0 text-danger" aria-label="Not yet" />
          )}
          <span className={r.pass ? "" : "text-muted"}>{r.label}</span>
        </li>
      ))}
    </ul>
  );
}
