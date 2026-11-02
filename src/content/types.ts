// Content model for the course. Chapter files are plain data (no React),
// so they can also be loaded by tests and by scripts/record-demos.ts.

export type Level = "beginner" | "intermediate" | "advanced" | "appendix";

export interface Turn {
  role: "user" | "assistant";
  content: string;
}

/** Everything needed to make one call to Claude. */
export interface PromptSpec {
  /** System prompt (optional). May contain {VARIABLES}. */
  system?: string;
  /** Earlier turns of the conversation, shown above the final user message. */
  history?: Turn[];
  /** The final user message. May contain {VARIABLES}. */
  user: string;
  /** Values substituted into {NAME} placeholders in `system` and `user`. */
  variables?: Record<string, string>;
  /**
   * How hard Claude thinks before answering. Defaults to "low" (fast and cheap).
   * Set it on an example to show the effort selector there.
   */
  effort?: Effort;
  /** A JSON schema the answer must follow, enforced by the API (structured outputs). */
  outputSchema?: Record<string, unknown>;
  /** Upper bound on the length of Claude's thinking plus answer, in tokens. */
  maxTokens?: number;
}

export type Effort = "low" | "medium" | "high";

export type EditableField = "system" | "user" | "history" | "variables";

/** A runnable example inside a lesson. */
export interface Example {
  /** Globally unique id; also the key for recorded demo answers. */
  id: string;
  title?: string;
  /** Short markdown note shown above the playground. */
  note?: string;
  prompt: PromptSpec;
  /** Fields the learner may edit. Defaults to every field that is present. */
  editable?: EditableField[];
  /** Show the system prompt box even when it is empty. */
  showSystem?: boolean;
}

/** One pass/fail criterion, shown as a line in the results checklist. */
export interface Criterion {
  label: string;
  test: (text: string) => boolean;
}

/** One input for exercises that run the same prompt over several cases. */
export interface TestCase {
  label: string;
  variables: Record<string, string>;
  /** Human-readable expected answer, shown in the results table. */
  expected: string;
  criteria: Criterion[];
}

export interface Exercise {
  /** e.g. "1.1" */
  id: string;
  title: string;
  /** What the learner has to achieve (markdown). */
  goal: string;
  /** The starting prompt. */
  start: PromptSpec;
  /** Which fields the learner is allowed to change. */
  editable: EditableField[];
  /** Criteria applied to Claude's response (single-run exercises). */
  criteria?: Criterion[];
  /** Criteria applied to the learner's prompt template before it runs. */
  promptCriteria?: Criterion[];
  /** Multi-case exercises: run the prompt once per case and grade each. */
  cases?: TestCase[];
  /** Open-ended exercises: a self-check rubric (and optional Claude feedback). */
  rubric?: string[];
  /** Progressive hints, gentlest first. */
  hints: string[];
  /** A sample solution, revealed after the hints. */
  solution?: PromptSpec;
  /** Shown once solved: why this works. */
  takeaway?: string;
  /** Show a live word counter on the response. */
  wordCounter?: boolean;
}

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
  explain: string;
}

export type CustomComponent =
  | "message-anatomy"
  | "prompt-builder"
  | "chain-runner"
  | "calculator-sandbox"
  | "database-exercise"
  | "retrieval-sandbox";

export type Block =
  | { kind: "text"; md: string }
  | { kind: "callout"; tone: "tip" | "note" | "warning" | "changed"; title?: string; md: string }
  | { kind: "playground"; example: Example }
  | {
      kind: "compare";
      title?: string;
      before: Example;
      after: Example;
      takeaway?: string;
      /** Neutral badge labels for side-by-side options that aren't a before/after improvement. */
      labels?: [string, string];
    }
  | { kind: "exercise"; exercise: Exercise }
  | {
      kind: "custom";
      component: CustomComponent;
      /** Which variant to show, for widgets with several (e.g. a chain id). */
      preset?: string;
      /** Set when the widget is a graded exercise, so it counts toward progress. */
      exerciseId?: string;
    };

export interface Section {
  id: string;
  title: string;
  blocks: Block[];
}

export interface Chapter {
  /** URL slug, e.g. "basic-prompt-structure" */
  id: string;
  /** Display number, e.g. "1" or "10.2" */
  number: string;
  title: string;
  level: Level;
  /** One-liner for the course map. */
  summary: string;
  minutes: number;
  /** "By the end of this chapter you will be able to…" */
  goals: string[];
  sections: Section[];
  quiz: QuizQuestion[];
}
