import { Panel } from "@/components/dashboard/Panel";
import { operatorConfig } from "@/lib/operatorConfig";

export function OperatorCard() {
  return (
    <Panel title="Operator">
      <div className="text-lg font-semibold text-ink-4">{operatorConfig.name}</div>
      <div className="text-sm text-ink-3">
        {operatorConfig.role} · {operatorConfig.location}
      </div>
      <div className="mono mt-2 rounded-md bg-ink-1 px-2 py-1.5 text-xs text-accent">
        {operatorConfig.focus}
      </div>
    </Panel>
  );
}
