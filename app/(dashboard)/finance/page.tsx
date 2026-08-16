import { FinancePulseCard } from "@/components/dashboard/FinancePulseCard";

export default function FinancePage() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FinancePulseCard />
    </div>
  );
}
