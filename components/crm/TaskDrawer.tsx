"use client";

import { useState } from "react";
import type { Entity, Task, Urgency } from "@/lib/types";

export function TaskDrawer({
  task,
  entities,
  onClose,
  onSave,
  onComplete,
  onDelete,
}: {
  task: Task;
  entities: Entity[];
  onClose: () => void;
  onSave: (patch: Partial<Task>) => void;
  onComplete: () => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [urgency, setUrgency] = useState<Urgency>(task.urgency);
  const [key, setKey] = useState(task.key);
  const [dueDate, setDueDate] = useState(task.due_date ?? "");
  const [entityId, setEntityId] = useState(task.entity_id ?? "");

  function save() {
    onSave({
      title,
      description: description || null,
      urgency,
      key,
      due_date: dueDate || null,
      entity_id: entityId || null,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="panel flex h-full w-full max-w-md flex-col gap-3 rounded-none p-5"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-md border border-ink-2 bg-ink-1 px-3 py-2 text-base font-medium text-ink-4 outline-none focus:border-accent"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description…"
          rows={4}
          className="resize-none rounded-md border border-ink-2 bg-ink-1 px-3 py-2 text-sm text-ink-4 outline-none focus:border-accent"
        />

        <label className="flex items-center justify-between text-sm text-ink-3">
          Urgency
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value as Urgency)}
            className="mono rounded-md border border-ink-2 bg-ink-1 px-2 py-1 text-xs text-ink-4"
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="someday">Someday</option>
          </select>
        </label>

        <label className="flex items-center justify-between text-sm text-ink-3">
          Key task
          <input type="checkbox" checked={key} onChange={(e) => setKey(e.target.checked)} />
        </label>

        <label className="flex items-center justify-between text-sm text-ink-3">
          Due date
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mono rounded-md border border-ink-2 bg-ink-1 px-2 py-1 text-xs text-ink-4"
          />
        </label>

        <label className="flex items-center justify-between text-sm text-ink-3">
          Entity
          <select
            value={entityId}
            onChange={(e) => setEntityId(e.target.value)}
            className="rounded-md border border-ink-2 bg-ink-1 px-2 py-1 text-xs text-ink-4"
          >
            <option value="">None</option>
            {entities.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-auto flex gap-2">
          <button onClick={save} className="flex-1 rounded-md bg-accent-dim px-3 py-2 text-sm text-accent">
            Save
          </button>
          <button
            onClick={onComplete}
            className="rounded-md bg-ok/15 px-3 py-2 text-sm text-ok"
          >
            Done
          </button>
          <button onClick={onDelete} className="rounded-md bg-danger/15 px-3 py-2 text-sm text-danger">
            Delete
          </button>
          <button onClick={onClose} className="rounded-md px-3 py-2 text-sm text-ink-3 hover:text-ink-4">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
