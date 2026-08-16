"use client";

import { useEffect, useState, type FormEvent } from "react";
import { KanbanView } from "@/components/crm/KanbanView";
import { SmartView } from "@/components/crm/SmartView";
import { CategoryView } from "@/components/crm/CategoryView";
import { TaskDrawer } from "@/components/crm/TaskDrawer";
import { useDemo } from "@/lib/demo/DemoContext";
import { demoTasks } from "@/lib/demoData";
import type { Entity, Task, Urgency } from "@/lib/types";

type View = "kanban" | "smart" | "category";
const VIEW_STORAGE_KEY = "personal-os-crm-view";

export function CrmBoard() {
  const { demo } = useDemo();
  const [view, setView] = useState<View>("kanban");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selected, setSelected] = useState<Task | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newUrgency, setNewUrgency] = useState<Urgency>("today");

  useEffect(() => {
    const saved = localStorage.getItem(VIEW_STORAGE_KEY) as View | null;
    if (saved) setView(saved);
  }, []);

  function changeView(next: View) {
    setView(next);
    localStorage.setItem(VIEW_STORAGE_KEY, next);
  }

  async function refresh() {
    if (demo) {
      setTasks(demoTasks());
      return;
    }
    const res = await fetch("/api/tasks?status=open");
    const data = await res.json();
    setTasks(data.tasks ?? []);
  }

  useEffect(() => {
    refresh();
    if (!demo) {
      fetch("/api/entities")
        .then((r) => r.json())
        .then((d) => setEntities(d.entities ?? []))
        .catch(() => setEntities([]));
    }
  }, [demo]);

  async function addTask(e: FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    if (demo) {
      setTasks((prev) => [
        {
          id: crypto.randomUUID(),
          user_id: "demo",
          title: newTitle,
          description: null,
          urgency: newUrgency,
          key: false,
          priority_score: (Math.max(0, ...prev.map((t) => t.priority_score)) || 0) + 10,
          time_estimate_min: null,
          tags: [],
          due_date: null,
          owner: null,
          entity_id: null,
          completed_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setNewTitle("");
      return;
    }
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: newTitle, urgency: newUrgency }),
    });
    setNewTitle("");
    refresh();
  }

  async function updateTask(id: string, patch: Partial<Task>) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    if (demo) return;
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
  }

  async function completeTask(id: string) {
    await updateTask(id, { completed_at: new Date().toISOString() });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setSelected(null);
    if (demo) return;
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg bg-ink-1 p-1">
          {(["kanban", "smart", "category"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => changeView(v)}
              className={`rounded-md px-3 py-1.5 text-sm capitalize ${
                view === v ? "bg-accent-dim text-accent" : "text-ink-3 hover:text-ink-4"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <form onSubmit={addTask} className="flex flex-1 gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New task…"
            className="flex-1 rounded-md border border-ink-2 bg-ink-1 px-3 py-1.5 text-sm text-ink-4 outline-none focus:border-accent"
          />
          <select
            value={newUrgency}
            onChange={(e) => setNewUrgency(e.target.value as Urgency)}
            className="mono rounded-md border border-ink-2 bg-ink-1 px-2 py-1.5 text-xs text-ink-3"
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="someday">Someday</option>
          </select>
          <button type="submit" className="rounded-md bg-accent-dim px-3 py-1.5 text-sm text-accent">
            Add
          </button>
        </form>
      </div>

      {view === "kanban" && (
        <KanbanView tasks={tasks} onSelect={setSelected} onReorder={setTasks} onUpdate={updateTask} />
      )}
      {view === "smart" && <SmartView tasks={tasks} onSelect={setSelected} />}
      {view === "category" && <CategoryView tasks={tasks} entities={entities} onSelect={setSelected} />}

      {selected && (
        <TaskDrawer
          task={selected}
          entities={entities}
          onClose={() => setSelected(null)}
          onSave={(patch) => updateTask(selected.id, patch)}
          onComplete={() => completeTask(selected.id)}
          onDelete={() => deleteTask(selected.id)}
        />
      )}
    </div>
  );
}
