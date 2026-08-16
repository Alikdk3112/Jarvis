import { downloadSheetAsXlsx, extractFinanceSnapshot, parseWorkbookTabs } from "@/lib/finance/sheets";
import { upsertDailyLogNotes } from "@/lib/dailyLogs";
import { localDateKey } from "@/lib/localDate";
import type { FinanceSnapshot } from "@/lib/types";

export async function runFinanceSnapshot(): Promise<FinanceSnapshot> {
  const fileId = process.env.GOOGLE_SHEETS_FINANCE_ID;
  if (!fileId) throw new Error("GOOGLE_SHEETS_FINANCE_ID is not configured");

  const buffer = await downloadSheetAsXlsx(fileId);
  const tabs = await parseWorkbookTabs(buffer);
  const snapshot = await extractFinanceSnapshot(tabs);

  await upsertDailyLogNotes(localDateKey(), { finance: snapshot });
  return snapshot;
}
