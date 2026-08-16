"use client";

import { useState, type FormEvent } from "react";

export function CaptureBox() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    const res = await fetch("/api/capture", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    });
    setBusy(false);
    if (res.ok) {
      setText("");
      setOpen(false);
      setToast("Captured");
      setTimeout(() => setToast(null), 2000);
    } else {
      setToast("Failed to capture");
      setTimeout(() => setToast(null), 2500);
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <form
        onSubmit={onSubmit}
        onFocus={() => setOpen(true)}
        className={`panel w-full max-w-xl p-3 transition-all ${open ? "shadow-2xl" : ""}`}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Capture a thought…"
          rows={open ? 3 : 1}
          className="w-full resize-none bg-transparent text-sm text-ink-4 outline-none placeholder:text-ink-3"
        />
        {open && (
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setText("");
              }}
              className="rounded-md px-3 py-1.5 text-sm text-ink-3 hover:text-ink-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !text.trim()}
              className="rounded-md bg-accent-dim px-3 py-1.5 text-sm font-medium text-accent disabled:opacity-50"
            >
              {busy ? "Sending…" : "Capture"}
            </button>
          </div>
        )}
      </form>
      {toast && (
        <div className="mono absolute bottom-20 rounded-md bg-ink-2 px-3 py-1.5 text-xs text-ink-4">
          {toast}
        </div>
      )}
    </div>
  );
}
