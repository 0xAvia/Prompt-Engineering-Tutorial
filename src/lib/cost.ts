import { getModel } from "./models";

export interface Usage {
  inputTokens: number;
  outputTokens: number;
}

export function estimateCost(modelId: string, usage: Usage): number {
  const m = getModel(modelId);
  return (usage.inputTokens * m.inputPrice + usage.outputTokens * m.outputPrice) / 1_000_000;
}

export function formatCost(usd: number): string {
  if (usd === 0) return "$0";
  if (usd < 0.0001) return "< $0.0001";
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  return `$${usd.toFixed(3)}`;
}
