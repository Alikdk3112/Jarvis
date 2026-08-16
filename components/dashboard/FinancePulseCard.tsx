"use client";

import { useEffect, useState } from "react";
import { Panel } from "@/components/dashboard/Panel";
import { useDemo } from "@/lib/demo/DemoContext";
import { demoFinance } from "@/lib/demoData";
import type { FinanceSnapshot } from "@/lib/types";

export function FinancePulseCard() {
  const { demo } = useDemo();
  const [snapshot, setSnapshot] = useState<FinanceSnapshot | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    if (demo) {
      setSnapshot(demoFinance());
      return;
    }
    fetch("/api/finance")
      .then((r) => r.json())
      .then((data) => setSnapshot(data.snapshot))
      .catch(() => setSnapshot(null));
  }

  useEffect(load, [demo]);

  async function refresh() {
    if (demo) return;
    setBusy(true);
    await fetch("/api/finance/snapshot", { method: "POST" }).catch(() => {});
    setBusy(false);
    load();
  }

  return (
    <Panel
      title="Finance Pulse"
      action={
        <button onClick={refresh} disabled={busy} className="text-xs text-ink-3 hover:text-accent disabled:opacity-50">
          {busy ? "Refreshing…" : "Refresh"}
        </button>
      }
    >
      {!snapshot ? (
        <p className="text-sm text-ink-3">
          No snapshot yet. Configure GOOGLE_SHEETS_FINANCE_ID and hit refresh.
        </p>
      ) : (
        <>
          <div className="mono text-2xl font-semibold text-ink-4">
            {snapshot.net_worth.toLocaleString(undefined, { style: "currency", currency: snapshot.currency })}
          </div>
          <div className="text-xs text-ink-3">as of {snapshot.as_of}</div>
          <ul className="mt-2 flex flex-col gap-1">
            {snapshot.categories.map((cat) => (
              <li key={cat.name} className="flex items-center justify-between text-sm">
                <span className="text-ink-3">{cat.name}</span>
                <span className="mono text-ink-4">
                  {cat.value.toLocaleString(undefined, { style: "currency", currency: snapshot.currency })}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Panel>
  );
}
