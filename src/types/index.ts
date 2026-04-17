export enum CharState {
  pending = "pending",
  correct = "correct",
  error = "error",
  current = "current",
}

export type KeyStats = Record<string, { attempts: number; errors: number }>;

export type Mode = "practice" | "test" | "free";

export interface Session {
  mode: Mode;
  text: string;
  typed: string;
  startedAt: number | null;
  duration: number; // seconds, for test mode
  wpm: number;
  accuracy: number;
  streak: number;
  bestStreak: number;
  finished: boolean;
  charStates: CharState[];
  activeKey: string | null;
  consecutiveErrors: number;
}

export interface SessionRecord {
  id: string;
  mode: Mode;
  wpm: number;
  accuracy: number;
  duration: number; // elapsed seconds
  charsTyped: number;
  bestStreak: number;
  completedAt: number; // timestamp
}

export type AIProvider = "deepseek" | "openai" | "anthropic";

export type SoundProfile = "minimal" | "nk-cream" | "typewriter" | "bubble";

export interface Settings {
  aiProvider: AIProvider;
  apiKey: string;
  testDuration: number;
  topN: number;
  wordCountTarget: number;
  soundEnabled: boolean;
  soundProfile: SoundProfile;
}
