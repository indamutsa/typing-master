"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useKeyStatsStore } from "@/store/keyStats";
import { useHistoryStore } from "@/store/history";
import { useSettingsStore } from "@/store/settings";

let syncTimeout: ReturnType<typeof setTimeout> | null = null;

function debouncedServerSync() {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    const stats = useKeyStatsStore.getState().stats;
    try {
      await fetch("/api/keystats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stats),
      });
    } catch {}
  }, 2000);
}

export default function ServerSync() {
  const { data: session, status } = useSession();
  const didMigrate = useRef(false);
  const didSubscribe = useRef(false);

  useEffect(() => {
    if (status === "loading") return;

    const isLoggedIn = !!session?.user?.id;

    if (isLoggedIn) {
      const userId = session.user!.id!;

      // One-time migration from localStorage to server
      const migrateKey = `typemaster-migrated-${userId}`;
      if (!didMigrate.current && !localStorage.getItem(migrateKey)) {
        didMigrate.current = true;

        const localKeyStats = localStorage.getItem("typemaster-keystats");
        const localHistory = localStorage.getItem("typemaster-history");
        const localSettings = localStorage.getItem("typemaster-settings");

        const keyStats = localKeyStats
          ? JSON.parse(localKeyStats)?.state?.stats
          : null;
        const sessions = localHistory
          ? JSON.parse(localHistory)?.state?.sessions
          : null;
        const settings = localSettings
          ? JSON.parse(localSettings)?.state
          : null;

        if (keyStats || sessions || settings) {
          fetch("/api/migrate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ keyStats, sessions, settings }),
          })
            .then((res) => {
              if (res.ok) localStorage.setItem(migrateKey, "true");
            })
            .catch(() => {});
        } else {
          localStorage.setItem(migrateKey, "true");
        }
      }

      // Load data from server
      Promise.all([
        fetch("/api/keystats").then((r) => r.json()),
        fetch("/api/sessions").then((r) => r.json()),
        fetch("/api/settings").then((r) => r.json()),
      ])
        .then(([stats, sessions, settings]) => {
          if (stats && Object.keys(stats).length > 0) {
            useKeyStatsStore.getState().setStats(stats);
          }
          if (Array.isArray(sessions) && sessions.length > 0) {
            useHistoryStore.getState().setSessions(sessions);
          }
          if (settings && !settings.error) {
            const store = useSettingsStore.getState();
            if (settings.aiProvider) store.setAiProvider(settings.aiProvider);
            if (settings.testDuration) store.setTestDuration(settings.testDuration);
            if (settings.topN) store.setTopN(settings.topN);
            if (settings.wordCountTarget) store.setWordCountTarget(settings.wordCountTarget);
            if (settings.soundEnabled !== undefined) store.setSoundEnabled(settings.soundEnabled);
          }
        })
        .catch(() => {});

      // Subscribe to keystats changes for debounced server sync
      if (!didSubscribe.current) {
        didSubscribe.current = true;
        useKeyStatsStore.subscribe(() => debouncedServerSync());
      }
    } else {
      // Anonymous: load from file-based keystats (backward compat)
      useKeyStatsStore.getState().loadFromServer();
    }
  }, [session, status]);

  return null;
}
