"use client";

import { useEffect, useState } from "react";
import { Panel } from "@/components/dashboard/Panel";
import { useDemo } from "@/lib/demo/DemoContext";
import { demoHabits } from "@/lib/demoData";
import { HABITS } from "@/lib/habitsConfig";
import { localDateKey } from "@/lib/localDate";
import type { HabitState } from "@/lib/types";

function storageKey(day: string) {
  return `personal-os-habits-${day}`;
}

export function HabitTrackerCard() {
  const { demo } = useDemo();
  const today = localDateKey();
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    if (demo) {
      setDone(demoHabits().done);
      return;
    }

    const cached = localStorage.getItem(storageKey(today));
    if (cached) setDone(JSON.parse(cached));

    fetch(`/api/habits?days=1`)
      .then((r) => r.json())
      .then((data) => {
        const todayEntry = data.habits?.find((h: { date: string }) => h.date === today);
        if (todayEntry) setDone(todayEntry.habits.done);
      })
      .catch(() => {});
  }, [demo, today]);

  async function toggle(habit: string) {
    if (demo) {
      setDone((prev) => (prev.includes(habit) ? prev.filter((h) => h !== habit) : [...prev, habit]));
      return;
    }

    const next = done.includes(habit) ? done.filter((h) => h !== habit) : [...done, habit];
    setDone(next);
    localStorage.setItem(storageKey(today), JSON.stringify(next));

    const state: HabitState = { done: next, total: HABITS.length };
    await fetch(`/api/habits/${today}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(state),
    }).catch(() => {});
  }

  return (
    <Panel title="Habit Tracker" action={<span className="mono text-xs text-ink-3">{done.length}/{HABITS.length}</span>}>
      <div className="grid grid-cols-3 gap-2">
        {HABITS.map((habit) => {
          const checked = done.includes(habit);
          return (
            <button
              key={habit}
              onClick={() => toggle(habit)}
              className={`rounded-md px-2 py-2 text-xs transition ${
                checked ? "bg-ok/15 text-ok" : "bg-ink-1 text-ink-3 hover:text-ink-4"
              }`}
            >
              {habit}
            </button>
          );
        })}
      </div>
    </Panel>
  );
}
