import { create } from "zustand";
import { CharState, Mode, Session } from "@/types";
import { calculateWPM, calculateAccuracy } from "@/lib/typing";

const MAX_CONSECUTIVE_ERRORS = 3;

interface SessionStore extends Session {
  correctCount: number;
  totalTyped: number;
  startSession: (mode: Mode, text: string, duration?: number) => void;
  typeChar: (char: string) => void;
  deleteChar: () => void;
  setActiveKey: (key: string | null) => void;
  finishSession: () => void;
  reset: () => void;
}

const initialState: Session & { correctCount: number; totalTyped: number } = {
  mode: "test",
  text: "",
  typed: "",
  startedAt: null,
  duration: 60,
  wpm: 0,
  accuracy: 100,
  streak: 0,
  bestStreak: 0,
  finished: false,
  charStates: [],
  activeKey: null,
  consecutiveErrors: 0,
  correctCount: 0,
  totalTyped: 0,
};

export const useSessionStore = create<SessionStore>((set, get) => ({
  ...initialState,

  startSession: (mode, text, duration = 60) => {
    set({
      ...initialState,
      mode,
      text,
      duration,
      charStates: text.split("").map((_, i) =>
        i === 0 ? CharState.current : CharState.pending
      ),
    });
  },

  setActiveKey: (key) => set({ activeKey: key }),

  typeChar: (char: string) => {
    const state = get();
    if (state.finished || !state.text) return;

    const pos = state.typed.length;
    if (pos >= state.text.length) return;

    // Block typing if max consecutive errors reached
    if (state.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) return;

    const now = Date.now();
    const startedAt = state.startedAt ?? now;
    const expected = state.text[pos];
    const isCorrect = char === expected;

    const newCharStates = [...state.charStates];
    newCharStates[pos] = isCorrect ? CharState.correct : CharState.error;
    if (pos + 1 < state.text.length) {
      newCharStates[pos + 1] = CharState.current;
    }

    const newCorrectCount = state.correctCount + (isCorrect ? 1 : 0);
    const newTotalTyped = state.totalTyped + 1;
    const newStreak = isCorrect ? state.streak + 1 : 0;
    const newBestStreak = Math.max(state.bestStreak, newStreak);
    const newConsecutiveErrors = isCorrect ? 0 : state.consecutiveErrors + 1;
    const newTyped = state.typed + char;
    const elapsed = now - startedAt;

    const finished = pos + 1 >= state.text.length;

    set({
      typed: newTyped,
      startedAt,
      charStates: newCharStates,
      correctCount: newCorrectCount,
      totalTyped: newTotalTyped,
      streak: newStreak,
      bestStreak: newBestStreak,
      consecutiveErrors: newConsecutiveErrors,
      wpm: calculateWPM(newCorrectCount, elapsed),
      accuracy: calculateAccuracy(newCorrectCount, newTotalTyped),
      finished,
    });
  },

  deleteChar: () => {
    const state = get();
    if (state.finished || !state.text || state.typed.length === 0) return;

    const pos = state.typed.length; // current cursor position (the one we're about to type)
    const prevPos = pos - 1; // the character we're erasing

    const newCharStates = [...state.charStates];

    // The char we're erasing: was it correct or error?
    const wasCorrect = newCharStates[prevPos] === CharState.correct;

    // Reset the erased position to pending, and move cursor back
    newCharStates[prevPos] = CharState.current;
    // The position that was "current" goes back to pending
    if (pos < state.text.length) {
      newCharStates[pos] = CharState.pending;
    }

    const newCorrectCount = state.correctCount - (wasCorrect ? 1 : 0);
    const newTotalTyped = state.totalTyped - 1;
    const newTyped = state.typed.slice(0, -1);
    const elapsed = state.startedAt ? Date.now() - state.startedAt : 0;

    // Reduce consecutive errors when deleting an error char
    const newConsecutiveErrors = !wasCorrect
      ? Math.max(0, state.consecutiveErrors - 1)
      : state.consecutiveErrors;

    set({
      typed: newTyped,
      charStates: newCharStates,
      correctCount: newCorrectCount,
      totalTyped: newTotalTyped,
      consecutiveErrors: newConsecutiveErrors,
      streak: 0, // backspace breaks the streak
      wpm: calculateWPM(newCorrectCount, elapsed),
      accuracy: calculateAccuracy(newCorrectCount, newTotalTyped),
    });
  },

  finishSession: () => {
    const state = get();
    const elapsed = state.startedAt ? Date.now() - state.startedAt : 0;
    set({
      finished: true,
      wpm: calculateWPM(state.correctCount, elapsed),
      accuracy: calculateAccuracy(state.correctCount, state.totalTyped),
    });
  },

  reset: () => set(initialState),
}));
