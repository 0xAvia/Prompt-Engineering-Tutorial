import type { ReactNode } from "react";
import { splitFilled } from "../lib/template";

const TAG_RE = /(<\/?[A-Za-z_][\w-]*>)/g;

/** Render plain text with <xml_tags> highlighted. */
export function highlightTags(text: string, keyPrefix = ""): ReactNode[] {
  return text.split(TAG_RE).map((part, i) =>
    i % 2 === 1 ? (
      <span key={keyPrefix + i} className="tok-tag">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/** A filled-in prompt template, with substituted values highlighted. */
export function FilledPrompt({ text, vars }: { text: string; vars?: Record<string, string> }) {
  const parts = splitFilled(text, vars);
  return (
    <>
      {parts.map((p, i) =>
        p.variable ? (
          <span key={i} className="tok-filled" title={`from {${p.variable}}`}>
            {highlightTags(p.text, `${i}-`)}
          </span>
        ) : (
          <span key={i}>{highlightTags(p.text, `${i}-`)}</span>
        ),
      )}
    </>
  );
}
