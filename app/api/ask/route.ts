import type { NextRequest } from "next/server";
import { searchMemory } from "@/lib/memory";
import { streamClaudeText } from "@/lib/ai/anthropic";

const SYSTEM_PROMPT =
  "You are the user's personal assistant. Answer the question using ONLY the context " +
  "provided. Cite sources by referring to capture IDs in [brackets]. If you don't have " +
  "enough context, say so.";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const question = typeof body?.question === "string" ? body.question : "";
  if (!question) return new Response("question is required", { status: 400 });

  const chunks = await searchMemory(question, 20);
  const context = chunks
    .map((c) => `[${c.source_id}] (${c.source_type}) ${c.text.slice(0, 800)}`)
    .join("\n\n");

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const text of streamClaudeText(SYSTEM_PROMPT, `Context:\n${context}\n\nQuestion: ${question}`)) {
          controller.enqueue(encoder.encode(text));
        }
      } catch (err) {
        controller.enqueue(encoder.encode(`\n\n[error: ${err instanceof Error ? err.message : "ask failed"}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
