"use client";

import { useEffect, useState } from "react";
import { Panel } from "@/components/dashboard/Panel";
import { useDemo } from "@/lib/demo/DemoContext";
import { demoTasks } from "@/lib/demoData";
import type { Task } from "@/lib/types";

export function SessionCard() {
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

  const top3 = tasks
    .filter((t) => t.urgency === "today" && t.key)
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, 3);

  return (
    <Panel title="Session">
      {top3.length === 0 ? (
        <p className="text-sm text-ink-3">No key tasks marked for today.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {top3.map((task) => (
            <li key={task.id}>
              <a
                href="/crm"
                className="flex items-center justify-between rounded-md bg-ink-1 px-3 py-2 text-sm text-ink-4 hover:bg-ink-2"
              >
                <span>{task.title}</span>
                {task.time_estimate_min && (
                  <span className="mono text-xs text-ink-3">{task.time_estimate_min}m</span>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
