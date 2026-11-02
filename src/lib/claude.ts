import Anthropic from "@anthropic-ai/sdk";
import type { MessageCreateParamsBase, MessageParam } from "@anthropic-ai/sdk/resources/messages/messages";
import type { Effort, PromptSpec } from "../content/types";
import { THINKING, getModel } from "./models";
import { fillTemplate } from "./template";

// Thinking counts toward max_tokens, so leave room for it on top of the answer.
const MAX_TOKENS: Record<Effort, number> = { low: 8000, medium: 12000, high: 16000 };

/**
 * Learners bring their own key, which never leaves their browser except to go
 * straight to Anthropic. That is the case `dangerouslyAllowBrowser` exists for.
 */
export function makeClient(apiKey: string): Anthropic {
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 1 });
}

/** The resolved request: what actually gets sent to Claude. */
export interface ResolvedRequest {
  model: string;
  system?: string;
  messages: MessageParam[];
  maxTokens: number;
  effort: Effort;
  outputSchema?: Record<string, unknown>;
}

export function resolveRequest(spec: PromptSpec, modelId: string): ResolvedRequest {
  const vars = spec.variables;
  const system = spec.system?.trim() ? fillTemplate(spec.system, vars) : undefined;
  const messages: MessageParam[] = [
    ...(spec.history ?? []).map((t) => ({ role: t.role, content: fillTemplate(t.content, vars) })),
    { role: "user" as const, content: fillTemplate(spec.user, vars) },
  ];
  const effort = spec.effort ?? "low";
  return {
    model: getModel(modelId).id,
    system,
    messages,
    effort,
    ...(spec.outputSchema ? { outputSchema: spec.outputSchema } : {}),
    maxTokens: spec.maxTokens ?? MAX_TOKENS[effort],
  };
}

/** Turn a resolved request into Messages API params. */
export function toParams(req: ResolvedRequest): MessageCreateParamsBase {
  return {
    model: getModel(req.model).id,
    max_tokens: req.maxTokens,
    ...(req.system ? { system: req.system } : {}),
    messages: req.messages,
    thinking: THINKING,
    output_config: {
      effort: req.effort,
      ...(req.outputSchema ? { format: { type: "json_schema" as const, schema: req.outputSchema } } : {}),
    },
  };
}

/** Check a request before sending it, so learners get a clear message instead of an API error. */
export function validateRequest(req: ResolvedRequest): string | null {
  const msgs = req.messages;
  for (let i = 0; i < msgs.length; i++) {
    const c = msgs[i].content;
    if (typeof c === "string" && !c.trim()) {
      return i === msgs.length - 1
        ? "Your message to Claude is empty. Type something first."
        : `Turn ${i + 1} of the conversation is empty. Every turn needs some text.`;
    }
    if (i === 0 && msgs[i].role !== "user") return "A conversation has to start with a User turn.";
    if (i > 0 && msgs[i].role === msgs[i - 1].role)
      return "User and Claude turns have to alternate: two turns in a row have the same role.";
  }
  return null;
}

export interface RunResult {
  text: string;
  thinking: string;
  inputTokens: number;
  outputTokens: number;
  stopReason: string | null;
  model: string;
}

export interface RunOptions {
  apiKey: string;
  modelId: string;
  signal?: AbortSignal;
  onText?: (snapshot: string) => void;
  onThinking?: (snapshot: string) => void;
}

/** Stream one prompt to Claude. Resolves with the final text; rejects with the SDK error. */
export async function runPrompt(spec: PromptSpec, opts: RunOptions): Promise<RunResult> {
  const req = resolveRequest(spec, opts.modelId);
  const problem = validateRequest(req);
  if (problem) throw new PromptProblem(problem);
  return runParams(toParams(req), opts);
}

export async function runParams(params: MessageCreateParamsBase, opts: RunOptions): Promise<RunResult> {
  const client = makeClient(opts.apiKey);
  const stream = client.messages.stream(params, { signal: opts.signal });
  if (opts.onText) stream.on("text", (_d, snap) => opts.onText!(snap));
  if (opts.onThinking) stream.on("thinking", (_d, snap) => opts.onThinking!(snap));
  const msg = await stream.finalMessage();
  let text = "";
  let thinking = "";
  for (const block of msg.content) {
    if (block.type === "text") text += block.text;
    else if (block.type === "thinking") thinking += block.thinking;
  }
  return {
    text,
    thinking,
    inputTokens: msg.usage.input_tokens,
    outputTokens: msg.usage.output_tokens,
    stopReason: msg.stop_reason,
    model: msg.model,
  };
}

/** A problem with the learner's prompt that we caught before calling the API. */
export class PromptProblem extends Error {}

export interface FriendlyError {
  title: string;
  detail: string;
  /** Show a "fix your key" action. */
  keyProblem?: boolean;
}

export function isAbort(e: unknown): boolean {
  return e instanceof Anthropic.APIUserAbortError || (e instanceof Error && e.name === "AbortError");
}

export function friendlyError(e: unknown): FriendlyError {
  if (e instanceof PromptProblem) return { title: "Check your prompt", detail: e.message };
  if (e instanceof Anthropic.AuthenticationError)
    return {
      title: "Your API key didn't work",
      detail: "Anthropic rejected the key. Check that you copied all of it (it starts with “sk-ant-”), or create a new one in the Claude Console.",
      keyProblem: true,
    };
  if (e instanceof Anthropic.PermissionDeniedError)
    return {
      title: "This key isn't allowed to do that",
      detail: "The key works but doesn't have permission for this request. Check the key's workspace and the models it can use in the Claude Console.",
      keyProblem: true,
    };
  if (e instanceof Anthropic.NotFoundError)
    return {
      title: "Model not available",
      detail: "Your account can't use the selected model. Try switching to Claude Haiku 5.5 in Settings.",
    };
  if (e instanceof Anthropic.RateLimitError)
    return {
      title: "Slow down a little",
      detail: "You've hit your account's rate limit. Wait a few seconds and try again.",
    };
  if (e instanceof Anthropic.BadRequestError) {
    const msg = e.message ?? "";
    if (/credit balance/i.test(msg))
      return {
        title: "Out of credit",
        detail: "Your Anthropic account has no credit left. Add some in the Claude Console under Billing; this course costs just cents to complete.",
        keyProblem: true,
      };
    return { title: "Claude couldn't accept this request", detail: cleanMessage(msg) };
  }
  if (e instanceof Anthropic.InternalServerError || (e instanceof Anthropic.APIError && e.status === 529))
    return {
      title: "Claude is busy right now",
      detail: "Anthropic's servers are overloaded or had a hiccup. Wait a moment and run it again.",
    };
  if (e instanceof Anthropic.APIConnectionError)
    return {
      title: "Couldn't reach Anthropic",
      detail: "Check your internet connection. A browser extension (like an ad or privacy blocker) can also block requests to api.anthropic.com.",
    };
  if (e instanceof Anthropic.APIError) return { title: `Something went wrong (${e.status ?? "error"})`, detail: cleanMessage(e.message) };
  return { title: "Something went wrong", detail: e instanceof Error ? e.message : String(e) };
}

function cleanMessage(msg: string): string {
  // SDK messages look like: 400 {"type":"error","error":{"type":"...","message":"..."}}
  const m = msg.match(/"message"\s*:\s*"([^"]+)"/);
  return m ? m[1] : msg;
}

/** Plain-English note for stop reasons other than a normal finish. */
export function stopNote(stopReason: string | null): string | null {
  switch (stopReason) {
    case "max_tokens":
      return "Claude hit the length limit for this exercise and was cut off mid-answer.";
    case "refusal":
      return "Claude declined to answer this one. Try rephrasing your prompt.";
    default:
      return null;
  }
}
