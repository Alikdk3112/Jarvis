"use client";

import { Fragment, useEffect, useState } from "react";
import { Panel } from "@/components/dashboard/Panel";
import type { Meal } from "@/lib/types";

interface DayEntry {
  date: string;
  meals: Meal[];
}

function totals(meals: Meal[]) {
  return meals.reduce(
    (acc, m) => ({ kcal: acc.kcal + m.kcal, p: acc.p + m.p, c: acc.c + m.c, f: acc.f + m.f }),
    { kcal: 0, p: 0, c: 0, f: 0 },
  );
}

export function HealthTable() {
  const [days, setDays] = useState<DayEntry[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/nutrition?days=30")
      .then((r) => r.json())
      .then((data) => setDays((data.days ?? []).slice().reverse()))
      .catch(() => setDays([]));
  }, []);

  const logged = days.filter((d) => d.meals.length > 0);
  const avg = logged.length
    ? logged.reduce(
        (acc, d) => {
          const t = totals(d.meals);
          return { kcal: acc.kcal + t.kcal, p: acc.p + t.p, c: acc.c + t.c, f: acc.f + t.f };
        },
        { kcal: 0, p: 0, c: 0, f: 0 },
      )
    : null;

  return (
    <Panel title="Health — last 30 days">
      {avg && (
        <div className="mono mb-2 flex gap-4 text-xs text-ink-3">
          <span>avg kcal {Math.round(avg.kcal / logged.length)}</span>
          <span>avg p {Math.round(avg.p / logged.length)}g</span>
          <span>avg c {Math.round(avg.c / logged.length)}g</span>
          <span>avg f {Math.round(avg.f / logged.length)}g</span>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="mono w-full text-left text-sm">
          <thead className="text-xs text-ink-3">
            <tr>
              <th className="py-1 pr-4">Date</th>
              <th className="py-1 pr-4">Kcal</th>
              <th className="py-1 pr-4">P</th>
              <th className="py-1 pr-4">C</th>
              <th className="py-1 pr-4">F</th>
              <th className="py-1">Meals</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => {
              const t = totals(day.meals);
              const isOpen = expanded === day.date;
              return (
                <Fragment key={day.date}>
                  <tr
                    onClick={() => setExpanded(isOpen ? null : day.date)}
                    className="cursor-pointer text-ink-4 hover:bg-ink-1"
                  >
                    <td className="py-1 pr-4">{day.date}</td>
                    <td className="py-1 pr-4">{Math.round(t.kcal)}</td>
                    <td className="py-1 pr-4">{Math.round(t.p)}</td>
                    <td className="py-1 pr-4">{Math.round(t.c)}</td>
                    <td className="py-1 pr-4">{Math.round(t.f)}</td>
                    <td className="py-1">{day.meals.length}</td>
                  </tr>
                  {isOpen && (
                    <tr>
                      <td colSpan={6} className="pb-2">
                        <ul className="flex flex-col gap-1 pl-4 text-xs text-ink-3">
                          {day.meals.map((m) => (
                            <li key={m.id}>
                              {m.t} — {m.n} ({Math.round(m.kcal)} kcal)
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
