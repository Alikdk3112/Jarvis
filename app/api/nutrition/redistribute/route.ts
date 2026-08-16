import { NextResponse, type NextRequest } from "next/server";
import { askClaudeJson } from "@/lib/ai/anthropic";

interface Macros {
  p: number;
  c: number;
  f: number;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name : "";
  const kcal = typeof body?.kcal === "number" ? body.kcal : null;
  if (!name || kcal === null) {
    return NextResponse.json({ error: "name and kcal are required" }, { status: 400 });
  }

  try {
    const macros = await askClaudeJson<Macros>(
      "You redistribute a food's macros to hit a new calorie target, keeping its " +
        'roughly proportions. Return {"p": number, "c": number, "f": number} in grams such that ' +
        "4*p + 4*c + 9*f is close to the target kcal.",
      `Food: "${name}"\nTarget kcal: ${kcal}`,
    );
    return NextResponse.json(macros);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "redistribute failed" },
      { status: 502 },
    );
  }
}
