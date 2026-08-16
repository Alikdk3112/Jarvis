"use client";

import { useEffect, useRef, useState } from "react";
import { Panel } from "@/components/dashboard/Panel";
import { useDemo } from "@/lib/demo/DemoContext";
import { demoMeals } from "@/lib/demoData";
import { localDateKey } from "@/lib/localDate";
import type { Meal } from "@/lib/types";

function storageKey(day: string) {
  return `personal-os-nutrition-${day}`;
}

export function NutritionCard() {
  const { demo } = useDemo();
  const today = localDateKey();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const redistributeTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    if (demo) {
      setMeals(demoMeals());
      return;
    }
    const cached = localStorage.getItem(storageKey(today));
    if (cached) setMeals(JSON.parse(cached));

    fetch(`/api/nutrition?days=1`)
      .then((r) => r.json())
      .then((data) => {
        const entry = data.days?.find((d: { date: string }) => d.date === today);
        if (entry) setMeals(entry.meals);
      })
      .catch(() => {});
  }, [demo, today]);

  function persist(next: Meal[]) {
    setMeals(next);
    if (demo) return;
    localStorage.setItem(storageKey(today), JSON.stringify(next));
    fetch(`/api/nutrition/${today}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ meals: next }),
    }).catch(() => {});
  }

  async function addMeal(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    let macros = { kcal: 0, p: 0, c: 0, f: 0 };
    try {
      const res = await fetch("/api/nutrition/estimate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) macros = await res.json();
    } catch {
      // best-effort — falls back to zeros, user can edit manually
    }
    setBusy(false);
    const meal: Meal = {
      id: crypto.randomUUID(),
      t: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
      n: text,
      ...macros,
      estimated: true,
    };
    persist([...meals, meal]);
    setText("");
  }

  function updateMacro(id: string, field: "p" | "c" | "f", value: number) {
    persist(
      meals.map((m) => {
        if (m.id !== id) return m;
        const next = { ...m, [field]: value };
        next.kcal = 4 * next.p + 4 * next.c + 9 * next.f;
        return next;
      }),
    );
  }

  function updateKcal(id: string, kcal: number) {
    persist(meals.map((m) => (m.id === id ? { ...m, kcal } : m)));
    clearTimeout(redistributeTimers.current[id]);
    redistributeTimers.current[id] = setTimeout(async () => {
      const meal = meals.find((m) => m.id === id);
      if (!meal) return;
      try {
        const res = await fetch("/api/nutrition/redistribute", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: meal.n, kcal }),
        });
        if (res.ok) {
          const macros = await res.json();
          persist(meals.map((m) => (m.id === id ? { ...m, kcal, ...macros } : m)));
        }
      } catch {
        // keep the manually-entered kcal even if redistribute fails
      }
    }, 600);
  }

  const totals = meals.reduce(
    (acc, m) => ({ kcal: acc.kcal + m.kcal, p: acc.p + m.p, c: acc.c + m.c, f: acc.f + m.f }),
    { kcal: 0, p: 0, c: 0, f: 0 },
  );

  return (
    <Panel title="Nutrition" action={<span className="mono text-xs text-ink-3">{Math.round(totals.kcal)} kcal</span>}>
      <form onSubmit={addMeal} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a meal…"
          className="flex-1 rounded-md border border-ink-2 bg-ink-1 px-3 py-1.5 text-sm text-ink-4 outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-accent-dim px-3 py-1.5 text-sm text-accent disabled:opacity-50"
        >
          {busy ? "…" : "Add"}
        </button>
      </form>
      <ul className="flex flex-col gap-2">
        {meals.map((meal) => (
          <li key={meal.id} className="rounded-md bg-ink-1 px-3 py-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-4">{meal.n}</span>
              <span className="mono text-xs text-ink-3">{meal.t}</span>
            </div>
            <div className="mono mt-1 grid grid-cols-4 gap-1 text-xs text-ink-3">
              <label className="flex flex-col">
                kcal
                <input
                  type="number"
                  value={Math.round(meal.kcal)}
                  onChange={(e) => updateKcal(meal.id, Number(e.target.value))}
                  className="rounded bg-ink-2 px-1 py-0.5 text-ink-4"
                />
              </label>
              {(["p", "c", "f"] as const).map((field) => (
                <label key={field} className="flex flex-col">
                  {field}
                  <input
                    type="number"
                    value={Math.round(meal[field])}
                    onChange={(e) => updateMacro(meal.id, field, Number(e.target.value))}
                    className="rounded bg-ink-2 px-1 py-0.5 text-ink-4"
                  />
                </label>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
