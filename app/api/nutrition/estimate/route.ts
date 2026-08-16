import { NextResponse, type NextRequest } from "next/server";
import { askClaudeJson } from "@/lib/ai/anthropic";

interface Macros {
  kcal: number;
  p: number;
  c: number;
  f: number;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text : "";
  if (!text) return NextResponse.json({ error: "text is required" }, { status: 400 });

  try {
    const macros = await askClaudeJson<Macros>(
      "You estimate nutrition macros from a free-text meal description. " +
        'Return {"kcal": number, "p": number, "c": number, "f": number} — kcal total, ' +
        "protein/carbs/fat in grams. Best estimate, no caveats in the output.",
      text,
    );
    return NextResponse.json(macros);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "estimate failed" },
      { status: 502 },
    );
  }
}
