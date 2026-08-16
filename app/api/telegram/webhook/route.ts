import { NextResponse, type NextRequest } from "next/server";
import { routeCapture } from "@/lib/router/routeCapture";
import { transcribeAudio } from "@/lib/ai/openai";
import { supabaseAdmin } from "@/lib/supabase/server";
import { USER_ID } from "@/lib/config";
import {
  answerCallbackQuery,
  downloadTelegramFile,
  sendTelegramMessage,
  urgencyKeyboard,
} from "@/lib/telegram";
import type { Urgency } from "@/lib/types";

async function handleCallbackQuery(token: string, callback: any) {
  const [action, captureId, value] = String(callback.data).split(":");
  const { data: capture } = await supabaseAdmin()
    .from("os_raw_captures")
    .select("routed_to, routed_id")
    .eq("id", captureId)
    .maybeSingle();

  if (capture?.routed_to === "tasks" && capture.routed_id) {
    const patch = action === "urgency" ? { urgency: value as Urgency } : { key: true };
    await supabaseAdmin().from("os_tasks").update(patch).eq("id", capture.routed_id).eq("user_id", USER_ID);
  }

  await answerCallbackQuery(token, callback.id, "Updated.");
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (!process.env.TELEGRAM_WEBHOOK_SECRET || secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not configured" }, { status: 500 });

  const body = await req.json().catch(() => null);

  if (body?.callback_query) {
    await handleCallbackQuery(token, body.callback_query);
    return NextResponse.json({ ok: true });
  }

  const message = body?.message;
  if (!message) return NextResponse.json({ ok: true });

  if (String(message.from?.id ?? "") !== process.env.TELEGRAM_USER_ID) {
    return NextResponse.json({ ok: true }); // not you — ignore silently
  }

  const chatId = message.chat.id;
  let text: string | undefined = message.text;
  let audioUrl: string | null = null;

  if (message.voice) {
    try {
      const file = await downloadTelegramFile(token, message.voice.file_id);
      text = await transcribeAudio(file);
      audioUrl = `telegram:${message.voice.file_id}`;
    } catch (err) {
      console.error("telegram webhook: transcription failed", err);
      await sendTelegramMessage(token, chatId, "Couldn't transcribe that voice note.");
      return NextResponse.json({ ok: true });
    }
  }

  if (!text?.trim()) {
    await sendTelegramMessage(token, chatId, "Send text or a voice note.");
    return NextResponse.json({ ok: true });
  }

  try {
    const capture = await routeCapture({ text, source: "telegram", audioUrl });
    await sendTelegramMessage(
      token,
      chatId,
      `Captured: ${capture.classification?.summary || text}`,
      urgencyKeyboard(capture.id),
    );
  } catch (err) {
    console.error("telegram webhook: capture failed", err);
    await sendTelegramMessage(token, chatId, "Capture failed — check the server logs.");
  }

  return NextResponse.json({ ok: true });
}
