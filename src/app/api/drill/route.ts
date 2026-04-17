import { NextResponse } from "next/server";

const PROVIDERS = {
  deepseek: {
    url: "https://api.deepseek.com/chat/completions",
    model: "deepseek-chat",
    envKey: "DEEPSEEK_API_KEY",
    headers: (apiKey: string) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
    body: (prompt: string) => ({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are a helpful assistant that generates typing practice text." },
        { role: "user", content: prompt },
      ],
      max_tokens: 400,
      stream: false,
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extractText: (data: any) => data.choices?.[0]?.message?.content?.trim(),
  },
  openai: {
    url: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o-mini",
    envKey: "OPENAI_API_KEY",
    headers: (apiKey: string) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
    body: (prompt: string) => ({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extractText: (data: any) => data.choices?.[0]?.message?.content?.trim(),
  },
  anthropic: {
    url: "https://api.anthropic.com/v1/messages",
    model: "claude-sonnet-4-20250514",
    envKey: "ANTHROPIC_API_KEY",
    headers: (apiKey: string) => ({
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    }),
    body: (prompt: string) => ({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extractText: (data: any) => data.content?.[0]?.text?.trim(),
  },
} as const;

type Provider = keyof typeof PROVIDERS;

function buildPrompt(weakKeys: string[]): string {
  const keyList = weakKeys.join(", ");
  return `Write a single coherent English paragraph of approximately 200 words. The paragraph should be natural prose — not a nonsense mashup — but should densely feature the following characters: ${keyList}. Use words that naturally contain these characters as much as possible. Do not include any explanation, just the paragraph.`;
}

export async function POST(request: Request) {
  try {
    const { weakKeys, provider = "deepseek" } = await request.json();

    if (!weakKeys || !Array.isArray(weakKeys) || weakKeys.length === 0) {
      return NextResponse.json({ error: "weakKeys required" }, { status: 400 });
    }

    const config = PROVIDERS[provider as Provider];
    if (!config) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    const apiKey = process.env[config.envKey];
    if (!apiKey) {
      return NextResponse.json(
        { error: `${config.envKey} not configured` },
        { status: 500 }
      );
    }

    const prompt = buildPrompt(weakKeys);
    const response = await fetch(config.url, {
      method: "POST",
      headers: config.headers(apiKey),
      body: JSON.stringify(config.body(prompt)),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI API error (${provider}):`, response.status, errorText);
      return NextResponse.json(
        { error: `AI API error: ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const text = config.extractText(data);

    if (!text) {
      return NextResponse.json({ error: "Empty AI response" }, { status: 502 });
    }

    // Normalize smart quotes and special chars to keyboard-typable equivalents
    const normalized = text
      .replace(/[\u2018\u2019\u201A\u2039\u203A]/g, "'")
      .replace(/[\u201C\u201D\u201E\u00AB\u00BB]/g, '"')
      .replace(/[\u2013\u2014]/g, "-")
      .replace(/\u2026/g, "...");

    return NextResponse.json({ text: normalized });
  } catch (err) {
    console.error("Drill generation error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
