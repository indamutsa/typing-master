"use client";

import { useEffect, useRef, useCallback } from "react";
import { CharState } from "@/types";
import { useSessionStore } from "@/store/session";
import { useKeyStatsStore } from "@/store/keyStats";
import { playKeystroke } from "@/lib/sound";

const charStateStyles: Record<CharState, string> = {
  [CharState.pending]: "text-zinc-600",
  [CharState.correct]: "text-teal-400",
  [CharState.error]: "text-red-500 bg-red-500/20",
  [CharState.current]: "text-amber-400 border-b-2 border-amber-400",
};

export default function TextDisplay() {
  const { text, charStates, finished, typed, consecutiveErrors } = useSessionStore();
  const typeChar = useSessionStore((s) => s.typeChar);
  const deleteChar = useSessionStore((s) => s.deleteChar);
  const setActiveKey = useSessionStore((s) => s.setActiveKey);
  const recordAttempt = useKeyStatsStore((s) => s.recordAttempt);
  const containerRef = useRef<HTMLDivElement>(null);

  const finishedRef = useRef(finished);
  finishedRef.current = finished;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (finishedRef.current) return;

      // Handle backspace
      if (e.key === "Backspace") {
        e.preventDefault();
        deleteChar();
        return;
      }

      if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;

      // Set active key for heatmap highlight
      setActiveKey(e.key.toLowerCase());

      const currentState = useSessionStore.getState();

      // Block if max consecutive errors reached
      if (currentState.consecutiveErrors >= 3) return;

      const pos = currentState.typed.length;
      const currentText = currentState.text;
      if (!currentText || pos >= currentText.length) return;

      const expected = currentText[pos];
      const isError = e.key !== expected;
      recordAttempt(expected.toLowerCase(), isError);
      playKeystroke(isError);
      typeChar(e.key);
    },
    [typeChar, deleteChar, setActiveKey, recordAttempt]
  );

  const handleKeyUp = useCallback(() => {
    setActiveKey(null);
  }, [setActiveKey]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    if (containerRef.current) {
      const currentChar = containerRef.current.querySelector("[data-current]");
      currentChar?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [typed]);

  if (!text) {
    return (
      <div className="text-zinc-500 text-center py-12" data-testid="text-display-empty">
        No text loaded. Select a mode to begin.
      </div>
    );
  }

  const isBlocked = consecutiveErrors >= 3;

  return (
    <div className="relative">
      {isBlocked && (
        <div
          className="absolute -top-8 left-0 right-0 text-center text-red-400 text-sm font-mono animate-pulse"
          data-testid="error-limit-warning"
        >
          Too many errors — press Backspace to fix
        </div>
      )}
      <div
        ref={containerRef}
        className="font-mono text-xl md:text-2xl leading-relaxed select-none max-h-[60vh] overflow-y-auto p-6"
        data-testid="text-display"
      >
        {text.split("").map((char, i) => (
          <span
            key={i}
            className={`${charStateStyles[charStates[i] || CharState.pending]} transition-colors duration-75`}
            data-testid={`char-${i}`}
            data-state={charStates[i] || CharState.pending}
            {...(charStates[i] === CharState.current ? { "data-current": true } : {})}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}
