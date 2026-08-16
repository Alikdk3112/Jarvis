import OpenAI from "openai";
import { openaiApiKey, openaiClassifierModel } from "@/lib/config";

let client: OpenAI | null = null;

function openai(): OpenAI {
  const apiKey = openaiApiKey();
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  if (!client) client = new OpenAI({ apiKey });
  return client;
}

export async function transcribeAudio(file: File): Promise<string> {
  const res = await openai().audio.transcriptions.create({
    file,
    model: "whisper-1",
  });
  return res.text;
}

export async function askOpenAiJson<T>(system: string, prompt: string): Promise<T> {
  const res = await openai().chat.completions.create({
    model: openaiClassifierModel(),
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
  });
  const text = res.choices[0]?.message?.content ?? "{}";
  return JSON.parse(text) as T;
}

export async function embedText(text: string): Promise<number[]> {
  const res = await openai().embeddings.create({
    model: "text-embedding-3-small",
    input: text.slice(0, 8000),
  });
  return res.data[0]?.embedding ?? [];
}
