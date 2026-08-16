"use client";

import { useEffect, useRef, useState } from "react";
import { Panel } from "@/components/dashboard/Panel";
import type { CalendarEvent } from "@/lib/calendar/ical";

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

export function CalendarCard() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selected, setSelected] = useState<string>(dayKey(new Date().toISOString()));
  const nowRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetch("/api/calendar")
      .then((r) => r.json())
      .then((data) => setEvents(data.events ?? []))
      .catch(() => setEvents([]));
  }, []);

  useEffect(() => {
    nowRef.current?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [events]);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return dayKey(d.toISOString());
  });

  const todayKey = dayKey(new Date().toISOString());
  const dayEvents = events.filter((e) => dayKey(e.start) === selected);

  return (
    <Panel title="Calendar">
      <div className="scrollbar-none flex gap-2 overflow-x-auto">
        {days.map((day) => {
          const isToday = day === todayKey;
          const count = events.filter((e) => dayKey(e.start) === day).length;
          return (
            <button
              key={day}
              ref={isToday ? nowRef : undefined}
              onClick={() => setSelected(day)}
              className={`mono flex min-w-14 flex-col items-center rounded-md px-2 py-2 text-xs ${
                selected === day ? "bg-accent-dim text-accent" : "bg-ink-1 text-ink-3"
              }`}
            >
              <span>{new Date(day).toLocaleDateString(undefined, { weekday: "short" })}</span>
              <span className="text-sm font-semibold">{new Date(day).getDate()}</span>
              {count > 0 && <span className="mt-1 h-1 w-1 rounded-full bg-accent" />}
            </button>
          );
        })}
      </div>
      <ul className="flex flex-col gap-2">
        {dayEvents.length === 0 ? (
          <p className="text-sm text-ink-3">No events.</p>
        ) : (
          dayEvents.map((e) => (
            <li key={e.uid} className="flex items-center justify-between rounded-md bg-ink-1 px-3 py-2 text-sm">
              <span className="text-ink-4">{e.summary}</span>
              <span className="mono text-xs text-ink-3">
                {e.allDay
                  ? "all day"
                  : new Date(e.start).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
              </span>
            </li>
          ))
        )}
      </ul>
    </Panel>
  );
}
