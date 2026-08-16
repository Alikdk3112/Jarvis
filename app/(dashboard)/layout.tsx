import { TopRail } from "@/components/dashboard/TopRail";
import { CaptureBox } from "@/components/dashboard/CaptureBox";
import { DemoProvider } from "@/lib/demo/DemoContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider>
      <div className="mx-auto flex min-h-dvh max-w-7xl flex-col gap-4 p-4 pb-28">
        <TopRail />
        <main className="flex-1">{children}</main>
        <CaptureBox />
      </div>
    </DemoProvider>
  );
}
