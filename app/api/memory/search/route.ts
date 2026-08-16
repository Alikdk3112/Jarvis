import { NextResponse, type NextRequest } from "next/server";
import { searchMemory } from "@/lib/memory";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const query = typeof body?.query === "string" ? body.query : "";
  if (!query) return NextResponse.json({ error: "query is required" }, { status: 400 });

  const matches = await searchMemory(query, 20);

  const taskIds = matches.filter((m) => m.source_type === "task").map((m) => m.source_id);
  const captureIds = matches.filter((m) => m.source_type === "capture").map((m) => m.source_id);

  const [{ data: tasks }, { data: captures }] = await Promise.all([
    taskIds.length
      ? supabaseAdmin().from("os_tasks").select("id, title, urgency").in("id", taskIds)
      : Promise.resolve({ data: [] }),
    captureIds.length
      ? supabaseAdmin().from("os_raw_captures").select("id, raw_text").in("id", captureIds)
      : Promise.resolve({ data: [] }),
  ]);

  const taskMap = new Map((tasks ?? []).map((t) => [t.id, t]));
  const captureMap = new Map((captures ?? []).map((c) => [c.id, c]));

  const results = matches.map((m) => ({
    ...m,
    source:
      m.source_type === "task"
        ? taskMap.get(m.source_id)
        : m.source_type === "capture"
          ? captureMap.get(m.source_id)
          : null,
  }));

  return NextResponse.json({ results });
}
