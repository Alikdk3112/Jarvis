import { OperatorCard } from "@/components/dashboard/OperatorCard";
import { FinancePulseCard } from "@/components/dashboard/FinancePulseCard";
import { KeyBlockersCard } from "@/components/dashboard/KeyBlockersCard";
import { SessionCard } from "@/components/dashboard/SessionCard";
import { HabitTrackerCard } from "@/components/dashboard/HabitTrackerCard";
import { CalendarCard } from "@/components/dashboard/CalendarCard";
import { NutritionCard } from "@/components/dashboard/NutritionCard";

export default function HomePage() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.4fr_1fr]">
      <div className="flex flex-col gap-4">
        <OperatorCard />
        <FinancePulseCard />
        <KeyBlockersCard />
      </div>
      <div className="flex flex-col gap-4">
        <SessionCard />
        <HabitTrackerCard />
        <CalendarCard />
      </div>
      <div className="flex flex-col gap-4">
        <NutritionCard />
      </div>
    </div>
  );
}
