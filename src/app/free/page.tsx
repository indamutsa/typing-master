"use client";

import { useState, useEffect } from "react";
import { useSessionStore } from "@/store/session";
import TextDisplay from "@/components/TextDisplay";
import HUD from "@/components/HUD";
import KeyHeatmap from "@/components/KeyHeatmap";
import ResultsModal from "@/components/ResultsModal";
import Link from "next/link";

export default function FreePage() {
  const startSession = useSessionStore((s) => s.startSession);
  const reset = useSessionStore((s) => s.reset);
  const text = useSessionStore((s) => s.text);
  const [inputText, setInputText] = useState("");

  // Reset any previous session when entering the page
  useEffect(() => {
    reset();
  }, [reset]);

  const handleSubmit = () => {
    const trimmed = inputText.trim();
    if (trimmed) {
      startSession("free", trimmed);
    }
  };

  return (
    <div className="min-h-[calc(100vh-45px)] flex flex-col bg-zinc-950" data-testid="free-page">
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
          <h1 className="text-lg font-bold text-amber-400">Free Mode</h1>
        </div>

        {!text ? (
          <div className="w-full max-w-2xl" data-testid="free-input-area">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste or type any text here, then click Start to begin typing..."
              className="w-full h-48 p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 font-mono text-sm resize-none focus:border-amber-500 outline-none"
              data-testid="free-textarea"
            />
            <button
              onClick={handleSubmit}
              disabled={!inputText.trim()}
              className="mt-4 w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-bold rounded-lg transition-colors"
              data-testid="free-start-btn"
            >
              Start Typing
            </button>
          </div>
        ) : (
          <>
            <TextDisplay />
            <div className="mt-8 w-full">
              <KeyHeatmap />
            </div>
          </>
        )}
      </div>
      <ResultsModal />
    </div>
  );
}
