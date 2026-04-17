import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AIProvider, SoundProfile, Settings } from "@/types";

interface SettingsStore extends Settings {
  setAiProvider: (provider: AIProvider) => void;
  setApiKey: (key: string) => void;
  setTestDuration: (seconds: number) => void;
  setTopN: (n: number) => void;
  setWordCountTarget: (count: number) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setSoundProfile: (profile: SoundProfile) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      aiProvider: "deepseek" as AIProvider,
      apiKey: "",
      testDuration: 60,
      topN: 5,
      wordCountTarget: 200,
      soundEnabled: false,
      soundProfile: "nk-cream" as SoundProfile,

      setAiProvider: (provider) => set({ aiProvider: provider }),
      setApiKey: (key) => set({ apiKey: key }),
      setTestDuration: (seconds) => set({ testDuration: seconds }),
      setTopN: (n) => set({ topN: n }),
      setWordCountTarget: (count) => set({ wordCountTarget: count }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setSoundProfile: (profile) => set({ soundProfile: profile }),
    }),
    {
      name: "typemaster-settings",
    }
  )
);
