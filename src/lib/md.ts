/**
 * Tagged template for markdown written inside TypeScript content files.
 * Removes the common leading indentation and trims blank lines at both ends,
 * so lesson text can be indented naturally in the source.
 */
export function md(strings: TemplateStringsArray, ...values: unknown[]): string {
  let raw = strings[0];
  for (let i = 0; i < values.length; i++) raw += String(values[i]) + strings[i + 1];
  return dedent(raw);
}

export function dedent(text: string): string {
  const lines = text.replace(/^\n+|\s+$/g, "").split("\n");
  const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length);
  const min = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(min)).join("\n");
}
