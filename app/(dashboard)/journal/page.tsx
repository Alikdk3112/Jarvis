import { GoalsCard } from "@/components/goals/GoalsCard";
import { JournalFeed } from "@/components/journal/JournalFeed";

export default function JournalPage() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <JournalFeed />
      <GoalsCard />
    </div>
  );
}
