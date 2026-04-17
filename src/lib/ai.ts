import { FALLBACK_PASSAGES } from "./keymap";
import { AIProvider } from "@/types";

export async function generateDrill(
  _apiKey: string,
  weakKeys: string[],
  provider: AIProvider = "deepseek"
): Promise<string> {
  if (weakKeys.length === 0) {
    return getRandomFallback();
  }

  try {
    const response = await fetch("/api/drill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weakKeys, provider }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.text) throw new Error("Empty response");
    return data.text;
  } catch {
    return getRandomFallback();
  }
}

function getRandomFallback(): string {
  return FALLBACK_PASSAGES[Math.floor(Math.random() * FALLBACK_PASSAGES.length)];
}
