import type { Entity, Task } from "@/lib/types";

export function CategoryView({
  tasks,
  entities,
  onSelect,
}: {
  tasks: Task[];
  entities: Entity[];
  onSelect: (t: Task) => void;
}) {
  const groups = new Map<string, Task[]>();
  for (const task of tasks) {
    const key = task.entity_id ?? "unassigned";
    groups.set(key, [...(groups.get(key) ?? []), task]);
  }

  function entityName(id: string): string {
    if (id === "unassigned") return "Unassigned";
    return entities.find((e) => e.id === id)?.name ?? "Unknown";
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {[...groups.entries()].map(([entityId, group]) => (
        <div key={entityId} className="panel flex flex-col gap-2 p-3">
          <h3 className="text-xs font-semibold tracking-wide text-ink-3 uppercase">
            {entityName(entityId)}
          </h3>
          {group.map((task) => (
            <div
              key={task.id}
              onClick={() => onSelect(task)}
              className="cursor-pointer rounded-md bg-ink-1 px-3 py-2 text-sm text-ink-4 hover:bg-ink-2"
            >
              {task.title}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
