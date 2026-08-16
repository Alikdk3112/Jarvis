"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";

export function SmartView({ tasks, onSelect }: { tasks: Task[]; onSelect: (t: Task) => void }) {
  const [query, setQuery] = useState("");
  const [ids, setIds] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);

  async function search() {
    if (!query.trim()) {
      setIds(null);
      return;
    }
    setBusy(true);
    const res = await fetch("/api/tasks/smart", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query }),
    });
    setBusy(false);
    if (res.ok) {
      const data = await res.json();
      setIds(data.ids ?? []);
    }
  }

  const results = ids
    ? (ids.map((id) => tasks.find((t) => t.id === id)).filter(Boolean) as Task[])
    : tasks;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder='Ask in plain English — "what should I do this morning"'
          className="flex-1 rounded-md border border-ink-2 bg-ink-1 px-3 py-2 text-sm text-ink-4 outline-none focus:border-accent"
        />
        <button
          onClick={search}
          disabled={busy}
          className="rounded-md bg-accent-dim px-4 py-2 text-sm text-accent disabled:opacity-50"
        >
          {busy ? "Thinking…" : "Search"}
        </button>
      </div>
      <ul className="flex flex-col gap-2">
        {results.map((task) => (
          <li
            key={task.id}
            onClick={() => onSelect(task)}
            className="cursor-pointer rounded-md bg-ink-1 px-3 py-2 text-sm text-ink-4 hover:bg-ink-2"
          >
            <div className="flex items-center justify-between">
              <span>{task.title}</span>
              <span className="mono text-xs text-ink-3">{task.urgency.replace("_", " ")}</span>
            </div>
          </li>
        ))}
        {results.length === 0 && <p className="text-sm text-ink-3">No matches.</p>}
      </ul>
    </div>
  );
}
