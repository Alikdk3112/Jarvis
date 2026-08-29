import Anthropic from "@anthropic-ai/sdk";
import { anthropicApiKey, anthropicModel } from "@/lib/config";

let client: Anthropic | null = null;

function anthropic(): Anthropic {
  const apiKey = anthropicApiKey();
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  if (!client) client = new Anthropic({ apiKey });
  return client;
}

/** Sends a prompt to Claude and returns raw text. Throws if no API key or the call fails. */
export async function askClaude(system: string, prompt: string): Promise<string> {
  const res = await anthropic().messages.create({
    model: anthropicModel(),
    max_tokens: 1024,
    system,
    messages: [{ role: "user", content: prompt }],
  });
  const block = res.content[0];
  return block?.type === "text" ? block.text : "";
}

/**
 * Strips a surrounding markdown fence if the model added one anyway — with or
 * without a language tag (```json, ```JSON, or a bare ```).
 */
function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```[a-zA-Z0-9]*[ \t]*\r?\n?([\s\S]*?)\r?\n?```$/);
  return (fenced?.[1] ?? trimmed).trim();
}

/** Same as askClaude, but parses the response as JSON. Throws on malformed output. */
export async function askClaudeJson<T>(system: string, prompt: string): Promise<T> {
  const text = await askClaude(`${system}\n\nRespond with JSON only, no prose, no markdown fences.`, prompt);
  return JSON.parse(stripCodeFence(text)) as T;
}

/** Streams Claude's reply as an async iterable of text chunks. */
export async function* streamClaudeText(system: string, prompt: string): AsyncGenerator<string> {
  const stream = anthropic().messages.stream({
    model: anthropicModel(),
    max_tokens: 1024,
    system,
    messages: [{ role: "user", content: prompt }],
  });
  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
}
