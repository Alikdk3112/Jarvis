import { supabaseAdmin } from "@/lib/supabase/server";
import { embedText } from "@/lib/ai/openai";
import { USER_ID, openaiApiKey } from "@/lib/config";
import type { MemoryChunk } from "@/lib/types";

/**
 * Embeds `text` and stores it in memory_chunks. Best-effort: if no OpenAI key
 * is configured, or the embed call fails, this logs and skips rather than
 * failing the write that triggered it — memory is additive, not load-bearing.
 */
export async function writeMemoryChunk(params: {
  sourceType: string;
  sourceId: string;
  text: string;
}): Promise<void> {
  if (!openaiApiKey()) return;
  try {
    const embedding = await embedText(params.text);
    await supabaseAdmin().from("memory_chunks").insert({
      user_id: USER_ID,
      source_type: params.sourceType,
      source_id: params.sourceId,
      text: params.text,
      embedding,
    });
  } catch (err) {
    console.error("writeMemoryChunk failed", err);
  }
}

export async function searchMemory(
  query: string,
  limit = 20,
): Promise<(MemoryChunk & { similarity: number })[]> {
  const embedding = await embedText(query);
  const { data, error } = await supabaseAdmin().rpc("match_memory_chunks", {
    query_embedding: embedding,
    match_user_id: USER_ID,
    match_count: limit,
  });
  if (error) throw new Error(error.message);
  return data ?? [];
}
