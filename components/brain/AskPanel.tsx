"use client";

import { useState } from "react";
import { Panel } from "@/components/dashboard/Panel";

export function AskPanel() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);

  async function ask() {
    if (!question.trim()) return;
    setBusy(true);
    setAnswer("");
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question }),
    });
    if (!res.body) {
      setBusy(false);
      return;
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      setAnswer((prev) => prev + decoder.decode(value, { stream: true }));
    }
    setBusy(false);
  }

  return (
    <Panel title="Ask my OS">
      <div className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="Ask a question about anything you've captured…"
          className="flex-1 rounded-md border border-ink-2 bg-ink-1 px-3 py-2 text-sm text-ink-4 outline-none focus:border-accent"
        />
        <button onClick={ask} disabled={busy} className="rounded-md bg-accent-dim px-4 py-2 text-sm text-accent">
          {busy ? "…" : "Ask"}
        </button>
      </div>
      {answer && <p className="whitespace-pre-wrap rounded-md bg-ink-1 px-3 py-2 text-sm text-ink-4">{answer}</p>}
    </Panel>
  );
}
