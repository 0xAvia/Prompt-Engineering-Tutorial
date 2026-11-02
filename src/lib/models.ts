import type { ThinkingConfigParam } from "@anthropic-ai/sdk/resources/messages/messages";

export type ModelId = "claude-haiku-5-5" | "claude-sonnet-5-5" | "claude-opus-5-5";

export interface ModelInfo {
  id: ModelId;
  name: string;
  blurb: string;
  /** USD per million tokens (prompts up to 100K tokens for Haiku). */
  inputPrice: number;
  outputPrice: number;
}

/**
 * Every current model thinks adaptively: it decides how much to reason based on the
 * task and the `effort` setting, and answers easy questions directly. We ask for a
 * summary of that thinking so learners can peek at it.
 *
 * Other current-API facts that shape the course: assistant "prefill" is rejected, and
 * sampling parameters like temperature are rejected, so answers vary run to run.
 */
export const THINKING: ThinkingConfigParam = { type: "adaptive", display: "summarized" };

export const MODELS: ModelInfo[] = [
  {
    id: "claude-haiku-5-5",
    name: "Claude Haiku 5.5",
    blurb: "Fast and very cheap. Perfect for practising, and the default for this course.",
    inputPrice: 0.1,
    outputPrice: 0.5,
  },
  {
    id: "claude-sonnet-5-5",
    name: "Claude Sonnet 5.5",
    blurb: "Smarter, still quick. Costs about 20× more than Haiku.",
    inputPrice: 2,
    outputPrice: 10,
  },
  {
    id: "claude-opus-5-5",
    name: "Claude Opus 5.5",
    blurb: "The most capable of the three. Costs about 40× more than Haiku.",
    inputPrice: 4,
    outputPrice: 20,
  },
];

export const DEFAULT_MODEL: ModelId = "claude-haiku-5-5";

export function getModel(id: string | null | undefined): ModelInfo {
  return MODELS.find((m) => m.id === id) ?? MODELS[0];
}
