function api(token: string, method: string) {
  return `https://api.telegram.org/bot${token}/${method}`;
}

export async function sendTelegramMessage(
  token: string,
  chatId: number,
  text: string,
  replyMarkup?: unknown,
) {
  await fetch(api(token, "sendMessage"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, reply_markup: replyMarkup }),
  });
}

export async function answerCallbackQuery(token: string, callbackQueryId: string, text?: string) {
  await fetch(api(token, "answerCallbackQuery"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
  });
}

export async function downloadTelegramFile(token: string, fileId: string): Promise<File> {
  const fileRes = await fetch(api(token, `getFile?file_id=${fileId}`));
  const fileData = await fileRes.json();
  const filePath = fileData.result?.file_path;
  if (!filePath) throw new Error("Telegram getFile returned no file_path");

  const audioRes = await fetch(`https://api.telegram.org/file/bot${token}/${filePath}`);
  if (!audioRes.ok) throw new Error(`Failed to download voice file: ${audioRes.status}`);
  const buffer = await audioRes.arrayBuffer();
  // Telegram voice notes are OGG/Opus — Whisper needs the right MIME type,
  // or it silently returns an empty transcript (see Part 8, bug list).
  return new File([buffer], "voice.ogg", { type: "audio/ogg" });
}

export function urgencyKeyboard(captureId: string) {
  return {
    inline_keyboard: [
      [
        { text: "Today", callback_data: `urgency:${captureId}:today` },
        { text: "This Week", callback_data: `urgency:${captureId}:this_week` },
      ],
      [
        { text: "This Month", callback_data: `urgency:${captureId}:this_month` },
        { text: "Someday", callback_data: `urgency:${captureId}:someday` },
      ],
      [{ text: "Key", callback_data: `key:${captureId}` }],
    ],
  };
}
