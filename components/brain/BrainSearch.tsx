"use client";

import { useState } from "react";
import { Panel } from "@/components/dashboard/Panel";

interface MemoryResult {
  id: string;
  source_type: string;
  source_id: string;
  text: string;
  similarity: number;
  source?: { title?: string; raw_text?: string } | null;
}

export function BrainSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MemoryResult[]>([]);
  const [busy, setBusy] = useState(false);

  async function search() {
    if (!query.trim()) return;
    setBusy(true);
    const res = await fetch("/api/memory/search", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query }),
    });
    setBusy(false);
    if (res.ok) {
      const data = await res.json();
      setResults(data.results ?? []);
    }
  }

  function openSource(result: MemoryResult) {
    if (result.source_type === "task") window.location.href = "/crm";
  }

  return (
    <Panel title="Brain">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder='What was that idea I had at the gym in March?'
          className="flex-1 rounded-md border border-ink-2 bg-ink-1 px-3 py-2 text-sm text-ink-4 outline-none focus:border-accent"
        />
        <button onClick={search} disabled={busy} className="rounded-md bg-accent-dim px-4 py-2 text-sm text-accent">
          {busy ? "Searching…" : "Search"}
        </button>
      </div>
      <ul className="flex flex-col gap-2">
        {results.map((r) => (
          <li
            key={r.id}
            onClick={() => openSource(r)}
            className="cursor-pointer rounded-md bg-ink-1 px-3 py-2 text-sm hover:bg-ink-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-ink-4">{r.source?.title ?? r.source?.raw_text ?? r.text}</span>
              <span className="mono text-xs text-ink-3">{Math.round(r.similarity * 100)}%</span>
            </div>
          </li>
        ))}
        {results.length === 0 && <p className="text-sm text-ink-3">Nothing indexed yet.</p>}
      </ul>
    </Panel>
  );
}
