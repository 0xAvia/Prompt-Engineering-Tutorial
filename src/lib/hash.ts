import type { PromptSpec } from "../content/types";
import { resolveRequest } from "./claude";

/** Stable fingerprint of what would be sent, ignoring the model. Used to key recorded demo answers. */
export function promptHash(spec: PromptSpec): string {
  const r = resolveRequest(spec, "claude-haiku-5-5");
  const s = JSON.stringify([r.system ?? "", r.messages, r.thinking]);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}
