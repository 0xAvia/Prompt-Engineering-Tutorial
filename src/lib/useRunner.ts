import { useCallback, useEffect, useRef, useState } from "react";
import type { PromptSpec } from "../content/types";
import { friendlyError, isAbort, runPrompt, type FriendlyError, type RunResult } from "./claude";
import type { DemoEntry } from "./demo";
import { getAppState } from "./storage";

export type RunStatus = "idle" | "running" | "done" | "error" | "stopped";

export interface RunState {
  status: RunStatus;
  text: string;
  thinking: string;
  result?: RunResult;
  error?: FriendlyError;
  elapsedMs?: number;
  /** "demo" when showing a recorded answer instead of a live call. */
  source?: "live" | "demo";
  demo?: DemoEntry;
}

const IDLE: RunState = { status: "idle", text: "", thinking: "" };

/** Runs prompts against Claude with streaming, stop and friendly errors. */
export function useRunner() {
  const [state, setState] = useState<RunState>(IDLE);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const run = useCallback(async (spec: PromptSpec): Promise<RunResult | null> => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const { apiKey, model } = getAppState();
    const t0 = performance.now();
    setState({ status: "running", text: "", thinking: "", source: "live" });
    try {
      const result = await runPrompt(spec, {
        apiKey,
        modelId: model,
        signal: ctrl.signal,
        onText: (text) => setState((s) => (s.status === "running" ? { ...s, text } : s)),
        onThinking: (thinking) => setState((s) => (s.status === "running" ? { ...s, thinking } : s)),
      });
      if (ctrl.signal.aborted) return null;
      setState({
        status: "done",
        text: result.text,
        thinking: result.thinking,
        result,
        elapsedMs: performance.now() - t0,
        source: "live",
      });
      return result;
    } catch (e) {
      if (isAbort(e) || ctrl.signal.aborted) {
        setState((s) => ({ ...s, status: "stopped" }));
        return null;
      }
      setState((s) => ({ ...s, status: "error", error: friendlyError(e) }));
      return null;
    }
  }, []);

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const showDemo = useCallback((demo: DemoEntry) => {
    setState({ status: "done", text: demo.text, thinking: demo.thinking ?? "", source: "demo", demo });
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState(IDLE);
  }, []);

  return { state, run, stop, showDemo, reset };
}
