"use client";

import { useEffect, useState } from "react";
import { Panel } from "@/components/dashboard/Panel";
import { useDemo } from "@/lib/demo/DemoContext";
import { demoTasks } from "@/lib/demoData";
import type { Task } from "@/lib/types";

/** Overdue or stuck key tasks — the things quietly blocking everything else. */
export function KeyBlockersCard() {
  const { demo } = useDemo();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (demo) {
      setTasks(demoTasks());
      return;
    }
    fetch("/api/tasks?status=open")
      .then((r) => r.json())
      .then((data) => setTasks(data.tasks ?? []))
      .catch(() => setTasks([]));
  }, [demo]);

  const today = new Date().toISOString().slice(0, 10);
  const blockers = tasks
    .filter((t) => t.key && t.due_date && t.due_date < today)
    .sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? ""))
    .slice(0, 5);

  return (
    <Panel title="Key Blockers">
      {blockers.length === 0 ? (
        <p className="text-sm text-ink-3">Nothing overdue. Clean.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {blockers.map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between rounded-md bg-danger/10 px-3 py-2 text-sm text-ink-4"
            >
              <span>{task.title}</span>
              <span className="mono text-xs text-danger">{task.due_date}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
