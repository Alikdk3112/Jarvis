import { BrainSearch } from "@/components/brain/BrainSearch";
import { AskPanel } from "@/components/brain/AskPanel";

export default function BrainPage() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <BrainSearch />
      <AskPanel />
    </div>
  );
}
