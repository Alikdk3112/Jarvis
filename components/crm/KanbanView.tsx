"use client";

import { useState } from "react";
import type { Task, Urgency } from "@/lib/types";

const TIERS: { key: Urgency; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "this_week", label: "This Week" },
  { key: "this_month", label: "This Month" },
  { key: "someday", label: "Someday" },
];

export function KanbanView({
  tasks,
  onSelect,
  onUpdate,
}: {
  tasks: Task[];
  onSelect: (t: Task) => void;
  onReorder: (tasks: Task[]) => void;
  onUpdate: (id: string, patch: Partial<Task>) => void;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  function tierTasks(urgency: Urgency) {
    return tasks
      .filter((t) => t.urgency === urgency)
      .sort((a, b) => b.priority_score - a.priority_score);
  }

  function handleDrop(urgency: Urgency, targetId: string | null) {
    if (!draggedId) return;
    const dragged = tasks.find((t) => t.id === draggedId);
    if (!dragged) return;

    const others = tierTasks(urgency).filter((t) => t.id !== draggedId);
    const targetIndex = targetId ? others.findIndex((t) => t.id === targetId) : others.length;
    const insertAt = targetIndex < 0 ? others.length : targetIndex;
    const reordered = [...others.slice(0, insertAt), dragged, ...others.slice(insertAt)];

    const n = reordered.length;
    reordered.forEach((t, i) => {
      const priority_score = (n - i) * 10;
      if (t.urgency !== urgency || t.priority_score !== priority_score) {
        onUpdate(t.id, { urgency, priority_score });
      }
    });
    setDraggedId(null);
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
      {TIERS.map((tier) => (
        <div
          key={tier.key}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(tier.key, null)}
          className="panel flex min-h-40 flex-col gap-2 p-3"
        >
          <h3 className="text-xs font-semibold tracking-wide text-ink-3 uppercase">{tier.label}</h3>
          {tierTasks(tier.key).map((task) => (
            <div
              key={task.id}
              draggable
              onDragStart={() => setDraggedId(task.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.stopPropagation();
                handleDrop(tier.key, task.id);
              }}
              onClick={() => onSelect(task)}
              className="cursor-pointer rounded-md bg-ink-1 px-3 py-2 text-sm text-ink-4 hover:bg-ink-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span>{task.title}</span>
                {task.key && <span className="text-xs text-accent">★</span>}
              </div>
              {task.tags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {task.tags.map((tag) => (
                    <span key={tag} className="mono rounded bg-ink-2 px-1.5 py-0.5 text-[10px] text-ink-3">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
