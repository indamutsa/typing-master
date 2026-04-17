"use client";

import { useState } from "react";
import { useSettingsStore } from "@/store/settings";
import { AIProvider, SoundProfile } from "@/types";

const PROVIDER_OPTIONS: { value: AIProvider; label: string; placeholder: string }[] = [
  { value: "deepseek", label: "DeepSeek", placeholder: "sk-..." },
  { value: "openai", label: "OpenAI (ChatGPT)", placeholder: "sk-..." },
  { value: "anthropic", label: "Anthropic (Claude)", placeholder: "sk-ant-..." },
];

export default function SettingsDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { apiKey, aiProvider, wordCountTarget, soundEnabled, soundProfile } = useSettingsStore();
  const setApiKey = useSettingsStore((s) => s.setApiKey);
  const setAiProvider = useSettingsStore((s) => s.setAiProvider);
  const setWordCountTarget = useSettingsStore((s) => s.setWordCountTarget);
  const setSoundEnabled = useSettingsStore((s) => s.setSoundEnabled);
  const setSoundProfile = useSettingsStore((s) => s.setSoundProfile);

  const currentProvider = PROVIDER_OPTIONS.find((p) => p.value === aiProvider) || PROVIDER_OPTIONS[0];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-[4.5rem] right-4 z-40 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors"
        data-testid="settings-trigger"
        aria-label="Settings"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsOpen(false)}
          data-testid="settings-overlay"
        >
          <div
            className="absolute right-0 top-0 h-full w-80 bg-zinc-900 border-l border-zinc-800 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            data-testid="settings-drawer"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-zinc-200">Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-zinc-300"
                data-testid="settings-close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm text-zinc-400">Sound Effects</label>
                  <p className="text-xs text-zinc-600">Off by default</p>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    soundEnabled ? "bg-amber-500" : "bg-zinc-700"
                  }`}
                  data-testid="sound-toggle"
                  aria-label="Toggle sound"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      soundEnabled ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>

              {soundEnabled && (
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Sound Profile
                  </label>
                  <select
                    value={soundProfile}
                    onChange={(e) => setSoundProfile(e.target.value as SoundProfile)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-sm focus:border-amber-500 outline-none"
                    data-testid="sound-profile-select"
                  >
                    <option value="nk-cream">NK Cream (Thocky)</option>
                    <option value="typewriter">Typewriter (Classic)</option>
                    <option value="bubble">Bubble (Soft Pop)</option>
                    <option value="minimal">Minimal (Beeps)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  AI Provider
                </label>
                <select
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value as AIProvider)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-sm focus:border-amber-500 outline-none"
                  data-testid="ai-provider-select"
                >
                  {PROVIDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  {currentProvider.label} API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={currentProvider.placeholder}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-sm font-mono focus:border-amber-500 outline-none"
                  data-testid="api-key-input"
                />
                <p className="text-xs text-zinc-600 mt-1">
                  Stored locally in your browser. Never sent to our servers.
                </p>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Practice Word Count Target
                </label>
                <input
                  type="number"
                  value={wordCountTarget}
                  onChange={(e) =>
                    setWordCountTarget(parseInt(e.target.value) || 200)
                  }
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-sm font-mono focus:border-amber-500 outline-none"
                  data-testid="word-count-input"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
