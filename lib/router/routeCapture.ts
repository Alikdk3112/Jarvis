import { supabaseAdmin } from "@/lib/supabase/server";
import { USER_ID } from "@/lib/config";
import { classifyCapture } from "@/lib/router/classifyCapture";
import { writeMemoryChunk } from "@/lib/memory";
import type { RawCapture } from "@/lib/types";

export async function routeCapture(params: {
  text: string;
  source: "telegram" | "web";
  audioUrl?: string | null;
}): Promise<RawCapture> {
  const admin = supabaseAdmin();

  const { data: entities } = await admin.from("entities").select("id").eq("user_id", USER_ID);
  const knownEntityIds = (entities ?? []).map((e) => e.id as string);

  const { classification, llm_source } = await classifyCapture(params.text, knownEntityIds);

  let routed_to: string | null = null;
  let routed_id: string | null = null;

  if (classification.kind === "task") {
    const { data: task } = await admin
      .from("tasks")
      .insert({
        user_id: USER_ID,
        title: classification.summary || params.text.slice(0, 140),
        description: params.text,
        urgency: classification.urgency,
        tags: classification.tags,
        entity_id: classification.entity_id,
      })
      .select()
      .single();
    if (task) {
      routed_to = "tasks";
      routed_id = task.id;
    }
  }

  const { data: capture, error } = await admin
    .from("raw_captures")
    .insert({
      user_id: USER_ID,
      source: params.source,
      raw_text: params.text,
      audio_url: params.audioUrl ?? null,
      classification,
      llm_source,
      routed_to,
      routed_id,
    })
    .select()
    .single();

  if (error || !capture) throw new Error(error?.message ?? "failed to write raw_captures");

  await writeMemoryChunk({ sourceType: "capture", sourceId: capture.id, text: params.text });

  await admin.from("audit_log").insert({
    user_id: USER_ID,
    action: "capture",
    resource_type: "raw_captures",
    resource_id: capture.id,
    metadata: { source: params.source, llm_source, kind: classification.kind },
  });

  return capture as RawCapture;
}
