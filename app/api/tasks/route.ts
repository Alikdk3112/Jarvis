import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { USER_ID } from "@/lib/config";
import { writeMemoryChunk } from "@/lib/memory";
import type { Task } from "@/lib/types";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") ?? "open";
  let query = supabaseAdmin().from("os_tasks").select("*").eq("user_id", USER_ID);
  query = status === "done" ? query.not("completed_at", "is", null) : query.is("completed_at", null);

  const { data, error } = await query.order("priority_score", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tasks: data as Task[] });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.title) return NextResponse.json({ error: "title is required" }, { status: 400 });

  const urgency = body.urgency ?? "someday";
  const admin = supabaseAdmin();

  // New tasks insert at the top of their tier.
  const { data: top } = await admin
    .from("os_tasks")
    .select("priority_score")
    .eq("user_id", USER_ID)
    .eq("urgency", urgency)
    .order("priority_score", { ascending: false })
    .limit(1)
    .maybeSingle();

  const priority_score = (top?.priority_score ?? 0) + 10;

  const { data, error } = await admin
    .from("os_tasks")
    .insert({
      user_id: USER_ID,
      title: body.title,
      description: body.description ?? null,
      urgency,
      key: Boolean(body.key),
      priority_score,
      time_estimate_min: body.time_estimate_min ?? null,
      tags: body.tags ?? [],
      due_date: body.due_date ?? null,
      owner: body.owner ?? null,
      entity_id: body.entity_id ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const task = data as Task;
  await writeMemoryChunk({ sourceType: "task", sourceId: task.id, text: task.title });
  return NextResponse.json({ task });
}
