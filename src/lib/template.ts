// Prompt templates use {NAME} placeholders, like the original tutorial's
// Python f-strings. Names are letters, digits and underscores.

const VAR_RE = /\{([A-Za-z_][A-Za-z0-9_]*)\}/g;

/** Unique placeholder names in the order they first appear. */
export function findVariables(...texts: (string | undefined)[]): string[] {
  const seen = new Set<string>();
  for (const t of texts) {
    if (!t) continue;
    for (const m of t.matchAll(VAR_RE)) seen.add(m[1]);
  }
  return [...seen];
}

/** Replace {NAME} with its value. Unknown names are left as-is. */
export function fillTemplate(text: string, vars: Record<string, string> | undefined): string {
  if (!vars) return text;
  return text.replace(VAR_RE, (whole, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? vars[name] : whole,
  );
}

export interface TemplatePart {
  text: string;
  /** Set when this part came from a variable. */
  variable?: string;
}

/** Split a template into literal text and filled-in variable parts (for highlighting). */
export function splitFilled(text: string, vars: Record<string, string> | undefined): TemplatePart[] {
  const parts: TemplatePart[] = [];
  let last = 0;
  for (const m of text.matchAll(VAR_RE)) {
    const name = m[1];
    const idx = m.index ?? 0;
    if (idx > last) parts.push({ text: text.slice(last, idx) });
    if (vars && Object.prototype.hasOwnProperty.call(vars, name)) {
      parts.push({ text: vars[name], variable: name });
    } else {
      parts.push({ text: m[0] });
    }
    last = idx + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}

/** Placeholders used in the template that have no value. */
export function missingVariables(texts: (string | undefined)[], vars: Record<string, string> | undefined): string[] {
  return findVariables(...texts).filter((n) => !vars || !(n in vars));
}
