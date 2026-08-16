import { NextResponse, type NextRequest } from "next/server";
import { cronSecret } from "@/lib/config";
import { isValidSessionCookie, SESSION_COOKIE } from "@/lib/auth/session";
import { runFinanceSnapshot } from "@/lib/finance/snapshot";

/**
 * The only route that runs the finance AI pipeline. Reachable two ways:
 * - Vercel cron, daily, with `Authorization: Bearer ${CRON_SECRET}`.
 * - The dashboard's manual refresh button, with a valid session cookie.
 * Never on a plain page load — that would burn API budget on every view.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const secret = cronSecret();
  const viaCron = Boolean(secret) && authHeader === `Bearer ${secret}`;
  const viaSession = await isValidSessionCookie(req.cookies.get(SESSION_COOKIE)?.value);

  if (!viaCron && !viaSession) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await runFinanceSnapshot();
    return NextResponse.json({ snapshot });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "snapshot failed" },
      { status: 502 },
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
