"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Panel } from "@/components/dashboard/Panel";
import { useDemo } from "@/lib/demo/DemoContext";
import { demoGoals } from "@/lib/demoData";
import type { GoalItem } from "@/lib/types";

function Section({
  title,
  items,
  onChange,
}: {
  title: string;
  items: GoalItem[];
  onChange: (items: GoalItem[]) => void;
}) {
  const [text, setText] = useState("");

  function add(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onChange([...items, { id: crypto.randomUUID(), text, done: false }]);
    setText("");
  }

  function toggle(id: string) {
    onChange(items.map((g) => (g.id === id ? { ...g, done: !g.done } : g)));
  }

  function remove(id: string) {
    onChange(items.filter((g) => g.id !== id));
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold tracking-wide text-ink-3 uppercase">{title}</h3>
      <ul className="flex flex-col gap-1">
        {items.map((g) => (
          <li key={g.id} className="flex items-center gap-2 rounded-md bg-ink-1 px-3 py-1.5 text-sm">
            <input type="checkbox" checked={g.done} onChange={() => toggle(g.id)} />
            <span className={g.done ? "flex-1 text-ink-3 line-through" : "flex-1 text-ink-4"}>{g.text}</span>
            <button onClick={() => remove(g.id)} className="text-xs text-ink-3 hover:text-danger">
              ✕
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a goal…"
          className="flex-1 rounded-md border border-ink-2 bg-ink-1 px-3 py-1.5 text-sm text-ink-4 outline-none focus:border-accent"
        />
      </form>
    </div>
  );
}

export function GoalsCard() {
  const { demo } = useDemo();
  const [week, setWeek] = useState<GoalItem[]>([]);
  const [month, setMonth] = useState<GoalItem[]>([]);

  useEffect(() => {
    if (demo) {
      const d = demoGoals();
      setWeek(d.week);
      setMonth(d.month);
      return;
    }
    fetch("/api/goals")
      .then((r) => r.json())
      .then((data) => {
        setWeek(data.week ?? []);
        setMonth(data.month ?? []);
      })
      .catch(() => {});
  }, [demo]);

  function save(scope: "week" | "month", items: GoalItem[]) {
    if (scope === "week") setWeek(items);
    else setMonth(items);
    if (demo) return;
    fetch("/api/goals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ scope, items }),
    }).catch(() => {});
  }

  return (
    <Panel title="Goals">
      <Section title="This Week" items={week} onChange={(items) => save("week", items)} />
      <Section title="This Month" items={month} onChange={(items) => save("month", items)} />
    </Panel>
  );
}
