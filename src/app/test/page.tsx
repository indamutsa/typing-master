"use client";

import { useEffect } from "react";
import { useSessionStore } from "@/store/session";
import { useSettingsStore } from "@/store/settings";
import TextDisplay from "@/components/TextDisplay";
import HUD from "@/components/HUD";
import KeyHeatmap from "@/components/KeyHeatmap";
import ResultsModal from "@/components/ResultsModal";
import Link from "next/link";

const TEST_TEXT =
  "The quick brown fox jumps over the lazy dog. Programming requires patience and precision. Every semicolon matters; every bracket must find its pair. Developers frequently jump between files, quickly fixing bugs and pushing code. The best programmers type with purpose, striking each key with quiet confidence. Practice makes perfect, especially for those tricky punctuation keys like semicolons, brackets, and forward slashes. A well-crafted function speaks volumes about the developer who wrote it. Clean code reads like well-written prose, guiding the reader through complex logic with clarity and purpose. The art of software engineering lies not just in making things work, but in making them elegant.";

export default function TestPage() {
  const startSession = useSessionStore((s) => s.startSession);
  const testDuration = useSettingsStore((s) => s.testDuration);

  useEffect(() => {
    // Always start a fresh session when entering test mode
    startSession("test", TEST_TEXT, testDuration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRestart = () => {
    startSession("test", TEST_TEXT, testDuration);
  };

  return (
    <div className="min-h-[calc(100vh-45px)] flex flex-col bg-zinc-950" data-testid="test-page">
      <HUD />
      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full px-4">
        <div className="flex items-center gap-4 mb-4 w-full">
          <Link
            href="/"
            className="text-zinc-500 hover:text-zinc-300 text-sm"
            data-testid="back-link"
          >
            ← Back
          </Link>
          <h1 className="text-lg font-bold text-amber-400">
            Test Mode — {testDuration}s
          </h1>
          <button
            onClick={handleRestart}
            className="ml-auto text-sm px-3 py-1 bg-zinc-800 text-zinc-400 rounded hover:bg-zinc-700 transition-colors"
            data-testid="restart-btn"
          >
            Restart
          </button>
        </div>

        <TextDisplay />

        <div className="mt-8 w-full">
          <KeyHeatmap />
        </div>
      </div>
      <ResultsModal />
    </div>
  );
}
