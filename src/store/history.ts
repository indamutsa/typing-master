import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SessionRecord } from "@/types";

interface HistoryStore {
  sessions: SessionRecord[];
  addSession: (session: SessionRecord) => void;
  removeSession: (id: string) => void;
  clearHistory: () => void;
  setSessions: (sessions: SessionRecord[]) => void;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      sessions: [],

      addSession: (session) =>
        set((state) => ({
          sessions: [session, ...state.sessions].slice(0, 50), // keep last 50
        })),

      removeSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
        })),

      clearHistory: () => set({ sessions: [] }),

      setSessions: (sessions) => set({ sessions }),
    }),
    {
      name: "typemaster-history",
    }
  )
);
