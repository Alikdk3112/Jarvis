import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { askClaudeJson } from "@/lib/ai/anthropic";
import { USER_ID } from "@/lib/config";
import type { Task } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const nlQuery = typeof body?.query === "string" ? body.query : "";
  if (!nlQuery) return NextResponse.json({ error: "query is required" }, { status: 400 });

  const { data: tasks, error } = await supabaseAdmin()
    .from("tasks")
    .select("id, title, urgency, key, tags, due_date")
    .eq("user_id", USER_ID)
    .is("completed_at", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!tasks?.length) return NextResponse.json({ ids: [] });

  try {
    const { ids } = await askClaudeJson<{ ids: string[] }>(
      "You interpret natural-language task queries against a task list. " +
        'Return {"ids": string[]} — the ids of matching tasks, best matches first.',
      `Query: "${nlQuery}"\n\nTasks:\n${JSON.stringify(tasks)}`,
    );
    return NextResponse.json({ ids });
  } catch {
    // Fallback: naive substring match so smart search degrades, not breaks.
    const needle = nlQuery.toLowerCase();
    const ids = (tasks as Pick<Task, "id" | "title">[])
      .filter((t) => t.title.toLowerCase().includes(needle))
      .map((t) => t.id);
    return NextResponse.json({ ids });
  }
}
