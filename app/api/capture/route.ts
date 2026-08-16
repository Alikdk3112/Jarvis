import { NextResponse, type NextRequest } from "next/server";
import { routeCapture } from "@/lib/router/routeCapture";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) return NextResponse.json({ error: "text is required" }, { status: 400 });

  try {
    const capture = await routeCapture({ text, source: "web" });
    return NextResponse.json({ capture });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "capture failed" },
      { status: 500 },
    );
  }
}
