import { GoogleAuth } from "google-auth-library";
import ExcelJS from "exceljs";
import { askClaudeJson } from "@/lib/ai/anthropic";
import type { FinanceSnapshot } from "@/lib/types";

function serviceAccountCredentials() {
  const client_email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!client_email || !rawKey) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_SERVICE_ACCOUNT_KEY are not configured");
  }
  // Vercel env vars can't hold real newlines — the private_key ships with
  // literal \n escapes that need unescaping before use.
  return { client_email, private_key: rawKey.replace(/\\n/g, "\n") };
}

async function accessToken(): Promise<string> {
  const auth = new GoogleAuth({
    credentials: serviceAccountCredentials(),
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  if (!token.token) throw new Error("Failed to obtain a Google access token");
  return token.token;
}

/** Exports the sheet as XLSX via the Drive API — never "publish to web" (see Part 7). */
export async function downloadSheetAsXlsx(fileId: string): Promise<ArrayBuffer> {
  const token = await accessToken();
  const mimeType = encodeURIComponent(
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${mimeType}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Drive export failed: ${res.status} ${await res.text()}`);
  return res.arrayBuffer();
}

export async function parseWorkbookTabs(buffer: ArrayBuffer): Promise<Record<string, unknown[][]>> {
  const workbook = new ExcelJS.Workbook();
  // exceljs's Buffer type comes from an older @types/node than this project
  // uses, so the two Buffer declarations don't structurally match — this
  // is a type-only cast, the runtime value is an ordinary ArrayBuffer.
  await workbook.xlsx.load(buffer as any);
  const tabs: Record<string, unknown[][]> = {};
  workbook.eachSheet((sheet) => {
    const rows: unknown[][] = [];
    sheet.eachRow((row) => {
      rows.push((row.values as unknown[]).slice(1));
    });
    tabs[sheet.name] = rows;
  });
  return tabs;
}

export async function extractFinanceSnapshot(
  tabs: Record<string, unknown[][]>,
): Promise<FinanceSnapshot> {
  return askClaudeJson<FinanceSnapshot>(
    "You extract a net worth summary from a dump of spreadsheet tabs (2D row arrays, one per tab, " +
      "messy and unlabeled). " +
      'Return {"net_worth": number, "currency": string, "as_of": "YYYY-MM-DD", ' +
      '"categories": [{"name": string, "value": number}], "notes": string}. ' +
      "Avoid double-counting: a summary tab plus per-category tabs describe the same money. " +
      "If a tab is a time series, use only its most recent row. Use `notes` to flag anything " +
      "ambiguous for human review; leave it empty if there's nothing to flag.",
    JSON.stringify(tabs).slice(0, 60_000),
  );
}
