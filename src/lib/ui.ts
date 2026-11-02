import { useSyncExternalStore } from "react";

// Tiny global UI state: the API key dialog can be opened from anywhere.

let keyDialogOpen = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function openKeyDialog() {
  keyDialogOpen = true;
  emit();
}
export function closeKeyDialog() {
  keyDialogOpen = false;
  emit();
}
export function useKeyDialogOpen() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => keyDialogOpen,
    () => false,
  );
}

/** Shared button class names. */
export const btn = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent shadow-sm transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50",
  ghost:
    "inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50",
};
