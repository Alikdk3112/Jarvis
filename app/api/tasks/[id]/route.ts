import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { USER_ID } from "@/lib/config";
import type { Task } from "@/lib/types";

const PATCHABLE_FIELDS = [
  "title",
  "description",
  "urgency",
  "key",
  "priority_score",
  "time_estimate_min",
  "tags",
  "due_date",
  "owner",
  "entity_id",
  "completed_at",
] as const;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const field of PATCHABLE_FIELDS) {
    if (field in body) patch[field] = body[field];
  }

  const { data, error } = await supabaseAdmin()
    .from("os_tasks")
    .update(patch)
    .eq("id", id)
    .eq("user_id", USER_ID)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ task: data as Task });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await supabaseAdmin().from("os_tasks").delete().eq("id", id).eq("user_id", USER_ID);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
