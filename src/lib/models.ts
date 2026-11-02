import type { ThinkingConfigParam } from "@anthropic-ai/sdk/resources/messages/messages";

export type ModelId = "claude-haiku-5-5" | "claude-sonnet-5-5" | "claude-opus-5-5";

export interface ModelInfo {
  id: ModelId;
  name: string;
  blurb: string;
  /** USD per million tokens (prompts up to 100K tokens for Haiku). */
  inputPrice: number;
  outputPrice: number;
  /** Thinking config sent when a lesson does NOT ask for thinking (undefined = omit the field). */
  thinkingOff: ThinkingConfigParam | undefined;
  /** Thinking config sent when a lesson turns thinking on. */
  thinkingOn: ThinkingConfigParam;
}

// Notes on the current API that shape these settings:
// - Assistant "prefill" is rejected by all of these models, so we never send it.
// - Sampling params (temperature etc.) are rejected, so answers vary run to run.
// - Haiku 5.5 may turn thinking off at effort <= high. Sonnet 5.5 turns it off with
//   "between_tools". Opus 5.5 cannot turn it off, so we omit the field and keep effort low.
export const MODELS: ModelInfo[] = [
  {
    id: "claude-haiku-5-5",
    name: "Claude Haiku 5.5",
    blurb: "Fast and very cheap. Perfect for practising, and the default for this course.",
    inputPrice: 0.1,
    outputPrice: 0.5,
    thinkingOff: { type: "disabled" },
    thinkingOn: { type: "adaptive", display: "summarized" },
  },
  {
    id: "claude-sonnet-5-5",
    name: "Claude Sonnet 5.5",
    blurb: "Smarter, still quick. Costs about 20× more than Haiku.",
    inputPrice: 2,
    outputPrice: 10,
    thinkingOff: { type: "between_tools" },
    thinkingOn: { type: "adaptive", display: "summarized" },
  },
  {
    id: "claude-opus-5-5",
    name: "Claude Opus 5.5",
    blurb: "The most capable of the three. Costs about 40× more than Haiku.",
    inputPrice: 4,
    outputPrice: 20,
    thinkingOff: undefined,
    thinkingOn: { type: "adaptive", display: "summarized" },
  },
];

export const DEFAULT_MODEL: ModelId = "claude-haiku-5-5";

export function getModel(id: string | null | undefined): ModelInfo {
  return MODELS.find((m) => m.id === id) ?? MODELS[0];
}
