import type { Criterion } from "../content/types";

// Small, readable building blocks for grading Claude's answers.
// Each returns a Criterion whose label is shown to the learner as a checklist line.

interface Opts {
  /** Ignore upper/lower case (default: true). */
  ignoreCase?: boolean;
  label?: string;
}

const norm = (s: string, ignoreCase: boolean) => (ignoreCase ? s.toLowerCase() : s);

/** Response contains `needle`. */
export function contains(needle: string, opts: Opts = {}): Criterion {
  const ic = opts.ignoreCase ?? true;
  return {
    label: opts.label ?? `Contains “${needle}”`,
    test: (t) => norm(t, ic).includes(norm(needle, ic)),
  };
}

/** Response contains at least one of `needles`. */
export function containsAny(needles: string[], opts: Opts = {}): Criterion {
  const ic = opts.ignoreCase ?? true;
  return {
    label: opts.label ?? `Contains ${needles.map((n) => `“${n}”`).join(" or ")}`,
    test: (t) => needles.some((n) => norm(t, ic).includes(norm(n, ic))),
  };
}

/** Response does NOT contain `needle`. */
export function notContains(needle: string, opts: Opts = {}): Criterion {
  const ic = opts.ignoreCase ?? true;
  return {
    label: opts.label ?? `Does not contain “${needle}”`,
    test: (t) => !norm(t, ic).includes(norm(needle, ic)),
  };
}

/** Response matches a regular expression. */
export function matches(re: RegExp, label: string): Criterion {
  return { label, test: (t) => re.test(t) };
}

/** Response is exactly `expected` (surrounding whitespace ignored). */
export function exactly(expected: string, opts: { label?: string; ignoreTrailingPeriod?: boolean } = {}): Criterion {
  return {
    label: opts.label ?? `Is exactly “${expected}” and nothing else`,
    test: (t) => {
      let s = t.trim();
      if (opts.ignoreTrailingPeriod) s = s.replace(/\.$/, "");
      return s === expected;
    },
  };
}

export function wordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** Response has at least `n` words. */
export function minWords(n: number): Criterion {
  return { label: `At least ${n} words`, test: (t) => wordCount(t) >= n };
}

/** Response has more than `n` lines. */
export function moreLinesThan(n: number): Criterion {
  return { label: `More than ${n} lines long`, test: (t) => t.split("\n").length > n };
}

/** Prompt-side check: the template still uses a {VARIABLE}. */
export function usesVariable(name: string): Criterion {
  return { label: `Your prompt uses the {${name}} placeholder`, test: (t) => t.includes(`{${name}}`) };
}

/** Prompt-side check: the template does not hard-code a word (or its plural, like "pigs"). */
export function doesNotHardcode(word: string, why?: string): Criterion {
  const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(s|es)?\\b`, "i");
  return {
    label: why ?? `Your prompt doesn't type “${word}” directly`,
    test: (t) => !re.test(t),
  };
}

/** Word stems that show a poem is about a given animal, even if it never names it. */
export const ANIMAL_WORDS: Record<string, string[]> = {
  pig: ["pig", "swine", "hog", "oink", "snout", "boar", "sow"],
  cat: ["cat", "kitten", "kitty", "tabby", "feline", "purr", "whisker", "meow"],
  dog: ["dog", "pup", "canine", "bark", "wag", "fetch", "hound"],
};

export interface GradeResult {
  label: string;
  pass: boolean;
}

export function grade(text: string, criteria: Criterion[]): GradeResult[] {
  return criteria.map((c) => {
    let pass = false;
    try {
      pass = c.test(text);
    } catch {
      pass = false;
    }
    return { label: c.label, pass };
  });
}

export const allPass = (r: GradeResult[]) => r.length > 0 && r.every((x) => x.pass);
