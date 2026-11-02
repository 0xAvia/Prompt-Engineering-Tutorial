import { useSyncExternalStore } from "react";
import { DEFAULT_MODEL, type ModelId, getModel } from "./models";

// Everything here lives only in this browser. Every storage access is wrapped in
// try/catch: private windows and blocked site data can make storage throw.

const KEY_API = "ps.apiKey";
const KEY_MODEL = "ps.model";
const KEY_THEME = "ps.theme";
const KEY_PROGRESS = "ps.progress";
const KEY_DEMO_ACK = "ps.demoAck";

function read(store: "local" | "session", key: string): string | null {
  try {
    return (store === "local" ? localStorage : sessionStorage).getItem(key);
  } catch {
    return null;
  }
}
function write(store: "local" | "session", key: string, value: string | null) {
  try {
    const s = store === "local" ? localStorage : sessionStorage;
    if (value === null) s.removeItem(key);
    else s.setItem(key, value);
  } catch {
    /* storage unavailable: keep the in-memory value only */
  }
}

export type Theme = "system" | "light" | "dark";

export interface Progress {
  /** Exercise ids the learner has solved, e.g. "1.1". */
  solved: Record<string, true>;
  /** Best quiz score per chapter id, as "correct/total". */
  quiz: Record<string, { correct: number; total: number }>;
  /** Chapters the learner has opened. */
  visited: Record<string, true>;
  lastChapter?: string;
}

interface State {
  apiKey: string;
  rememberKey: boolean;
  model: ModelId;
  theme: Theme;
  progress: Progress;
  demoAcknowledged: boolean;
}

function loadProgress(): Progress {
  const empty: Progress = { solved: {}, quiz: {}, visited: {} };
  const raw = read("local", KEY_PROGRESS);
  if (!raw) return empty;
  try {
    const p = JSON.parse(raw) as Partial<Progress>;
    return { solved: p.solved ?? {}, quiz: p.quiz ?? {}, visited: p.visited ?? {}, lastChapter: p.lastChapter };
  } catch {
    return empty;
  }
}

function loadState(): State {
  const localKey = read("local", KEY_API);
  const sessionKey = read("session", KEY_API);
  const theme = read("local", KEY_THEME);
  return {
    apiKey: localKey ?? sessionKey ?? "",
    rememberKey: localKey !== null,
    model: getModel(read("local", KEY_MODEL) ?? DEFAULT_MODEL).id,
    theme: theme === "light" || theme === "dark" ? theme : "system",
    progress: loadProgress(),
    demoAcknowledged: read("local", KEY_DEMO_ACK) === "1",
  };
}

let state: State = loadState();
const listeners = new Set<() => void>();
function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useAppState(): State {
  return useSyncExternalStore(subscribe, () => state, () => state);
}
export const getAppState = () => state;

// ----- API key -----
export function saveApiKey(key: string, remember: boolean) {
  const k = key.trim();
  write("local", KEY_API, remember && k ? k : null);
  write("session", KEY_API, !remember && k ? k : null);
  set({ apiKey: k, rememberKey: remember });
}
export function clearApiKey() {
  write("local", KEY_API, null);
  write("session", KEY_API, null);
  set({ apiKey: "" });
}

// ----- Model / theme -----
export function setModel(id: ModelId) {
  write("local", KEY_MODEL, id);
  set({ model: id });
}
export function setTheme(theme: Theme) {
  write("local", KEY_THEME, theme === "system" ? null : theme);
  if (theme === "system") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
  set({ theme });
}
export function acknowledgeDemo() {
  write("local", KEY_DEMO_ACK, "1");
  set({ demoAcknowledged: true });
}

// ----- Progress -----
function saveProgress(p: Progress) {
  write("local", KEY_PROGRESS, JSON.stringify(p));
  set({ progress: p });
}
export function markSolved(exerciseId: string) {
  if (state.progress.solved[exerciseId]) return;
  saveProgress({ ...state.progress, solved: { ...state.progress.solved, [exerciseId]: true } });
}
export function markVisited(chapterId: string) {
  const p = state.progress;
  if (p.visited[chapterId] && p.lastChapter === chapterId) return;
  saveProgress({ ...p, visited: { ...p.visited, [chapterId]: true }, lastChapter: chapterId });
}
export function recordQuiz(chapterId: string, correct: number, total: number) {
  const prev = state.progress.quiz[chapterId];
  if (prev && prev.correct >= correct) return;
  saveProgress({ ...state.progress, quiz: { ...state.progress.quiz, [chapterId]: { correct, total } } });
}
export function resetProgress() {
  saveProgress({ solved: {}, quiz: {}, visited: {} });
}
