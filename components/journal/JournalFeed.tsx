"use client";

import { useEffect, useState } from "react";
import { Panel } from "@/components/dashboard/Panel";
import type { RawCapture } from "@/lib/types";

export function JournalFeed() {
  const [entries, setEntries] = useState<RawCapture[]>([]);

  useEffect(() => {
    fetch("/api/journal")
      .then((r) => r.json())
      .then((data) => setEntries(data.entries ?? []))
      .catch(() => setEntries([]));
  }, []);

  return (
    <Panel title="Journal">
      {entries.length === 0 ? (
        <p className="text-sm text-ink-3">
          Nothing yet — voice notes and captures classified as journal entries show up here.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((entry) => (
            <li key={entry.id} className="rounded-md bg-ink-1 px-3 py-2">
              <div className="mono mb-1 text-xs text-ink-3">
                {new Date(entry.created_at).toLocaleString()}
              </div>
              <p className="text-sm text-ink-4">{entry.classification?.summary ?? entry.raw_text}</p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
