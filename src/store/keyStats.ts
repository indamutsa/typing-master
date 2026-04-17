import { create } from "zustand";
import { persist } from "zustand/middleware";
import { KeyStats } from "@/types";

let syncTimeout: ReturnType<typeof setTimeout> | null = null;

function debouncedSync(stats: KeyStats) {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    fetch("/api/keystats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stats),
    }).catch(() => {});
  }, 2000);
}

interface KeyStatsStore {
  stats: KeyStats;
  recordAttempt: (key: string, isError: boolean) => void;
  mergeStats: (newStats: KeyStats) => void;
  clearStats: () => void;
  setStats: (stats: KeyStats) => void;
  loadFromServer: () => Promise<void>;
}

export const useKeyStatsStore = create<KeyStatsStore>()(
  persist(
    (set, get) => ({
      stats: {},

      recordAttempt: (key: string, isError: boolean) => {
        set((state) => {
          const current = state.stats[key] || { attempts: 0, errors: 0 };
          const newStats = {
            ...state.stats,
            [key]: {
              attempts: current.attempts + 1,
              errors: current.errors + (isError ? 1 : 0),
            },
          };
          debouncedSync(newStats);
          return { stats: newStats };
        });
      },

      mergeStats: (newStats: KeyStats) => {
        set((state) => {
          const merged = { ...state.stats };
          for (const [key, val] of Object.entries(newStats)) {
            const current = merged[key] || { attempts: 0, errors: 0 };
            merged[key] = {
              attempts: current.attempts + val.attempts,
              errors: current.errors + val.errors,
            };
          }
          debouncedSync(merged);
          return { stats: merged };
        });
      },

      clearStats: () => {
        set({ stats: {} });
        debouncedSync({});
      },

      setStats: (stats: KeyStats) => set({ stats }),

      loadFromServer: async () => {
        try {
          const res = await fetch("/api/keystats");
          if (!res.ok) return;
          const serverStats: KeyStats = await res.json();
          if (!serverStats || Object.keys(serverStats).length === 0) return;

          const local = get().stats;
          // Merge: take the higher counts from either source per key
          const merged = { ...serverStats };
          for (const [key, val] of Object.entries(local)) {
            const server = merged[key] || { attempts: 0, errors: 0 };
            merged[key] = {
              attempts: Math.max(server.attempts, val.attempts),
              errors: Math.max(server.errors, val.errors),
            };
          }
          set({ stats: merged });
        } catch {
          // Server unavailable — localStorage is the fallback
        }
      },
    }),
    {
      name: "typemaster-keystats",
    }
  )
);
