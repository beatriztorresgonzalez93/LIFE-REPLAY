import Constants from "expo-constants";
import { EMBEDDED_GROQ_API_KEY } from "./env.generated";

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

const extra = Constants.expoConfig?.extra as { groqApiKey?: string } | undefined;

function firstNonEmpty(...values: (string | undefined)[]) {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

export function getGroqApiKey() {
  return firstNonEmpty(
    extra?.groqApiKey,
    process.env.EXPO_PUBLIC_GROQ_API_KEY,
    EMBEDDED_GROQ_API_KEY,
    process.env.GROQ_API_KEY
  );
}

export function isGroqConfigured() {
  return getGroqApiKey().length > 0;
}

type ChatMessage = { role: "system" | "user"; content: string };

export async function groqChatCompletion(
  messages: ChatMessage[],
  options?: { model?: string; maxTokens?: number }
): Promise<string> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error(
      "Falta la API key de Groq. Añade EXPO_PUBLIC_GROQ_API_KEY en .env (consola.groq.com)."
    );
  }

  const res = await fetch(GROQ_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options?.model ?? DEFAULT_MODEL,
      messages,
      temperature: 0.85,
      max_tokens: options?.maxTokens ?? 900,
      response_format: { type: "json_object" },
    }),
  });

  const body = (await res.json()) as {
    error?: { message?: string };
    choices?: { message?: { content?: string } }[];
  };

  if (!res.ok) {
    const msg = body.error?.message ?? `Groq respondió con ${res.status}`;
    throw new Error(msg);
  }

  const content = body.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Groq no devolvió texto en la respuesta.");
  }

  return content;
}
