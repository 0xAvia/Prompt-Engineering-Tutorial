import type Anthropic from "@anthropic-ai/sdk";
import { makeClient } from "./claude";
import { THINKING, getModel } from "./models";

export type TraceStep =
  | { kind: "text"; text: string }
  | { kind: "call"; id: string; name: string; input: Record<string, unknown> }
  | { kind: "result"; id: string; content: string; isError: boolean };

export interface ToolLoopResult {
  trace: TraceStep[];
  finalText: string;
  inputTokens: number;
  outputTokens: number;
}

/** Runs a tool the model asked for. Throw to report an error back to Claude. */
export type ToolExecutor = (name: string, input: Record<string, unknown>) => unknown;

/**
 * The tool-use loop: send the request; while Claude asks for tools, run them in the
 * browser and send the results back; stop when Claude gives a final answer.
 */
export async function runToolLoop(opts: {
  apiKey: string;
  modelId: string;
  system?: string;
  user: string;
  tools: Anthropic.Tool[];
  execute: ToolExecutor;
  signal?: AbortSignal;
  onStep?: (trace: TraceStep[]) => void;
  maxRounds?: number;
}): Promise<ToolLoopResult> {
  const client = makeClient(opts.apiKey);
  const model = getModel(opts.modelId);
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: opts.user }];
  const trace: TraceStep[] = [];
  let inputTokens = 0;
  let outputTokens = 0;
  let finalText = "";

  for (let round = 0; round < (opts.maxRounds ?? 6); round++) {
    const response = await client.messages.create(
      {
        model: model.id,
        max_tokens: 4000, // thinking counts toward this too
        ...(opts.system?.trim() ? { system: opts.system } : {}),
        tools: opts.tools,
        messages,
        output_config: { effort: "low" },
        thinking: THINKING,
      },
      { signal: opts.signal },
    );
    inputTokens += response.usage.input_tokens;
    outputTokens += response.usage.output_tokens;

    // Keep Claude's turn exactly as returned (append-only history).
    messages.push({ role: "assistant", content: response.content });

    const results: Anthropic.ToolResultBlockParam[] = [];
    let text = "";
    for (const block of response.content) {
      if (block.type === "text") {
        text += block.text;
        if (block.text.trim()) trace.push({ kind: "text", text: block.text });
      } else if (block.type === "tool_use") {
        const input = (block.input ?? {}) as Record<string, unknown>;
        trace.push({ kind: "call", id: block.id, name: block.name, input });
        let content: string;
        let isError = false;
        try {
          const out = opts.execute(block.name, input);
          content = typeof out === "string" ? out : JSON.stringify(out);
        } catch (e) {
          content = e instanceof Error ? e.message : String(e);
          isError = true;
        }
        trace.push({ kind: "result", id: block.id, content, isError });
        results.push({ type: "tool_result", tool_use_id: block.id, content, ...(isError ? { is_error: true } : {}) });
      }
    }
    opts.onStep?.([...trace]);

    if (response.stop_reason !== "tool_use" || results.length === 0) {
      finalText = text;
      break;
    }
    // All results for this turn go back in a single user message.
    messages.push({ role: "user", content: results });
  }

  return { trace, finalText, inputTokens, outputTokens };
}
