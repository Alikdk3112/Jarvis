export type Urgency = "today" | "this_week" | "this_month" | "someday";

export interface Entity {
  id: string;
  user_id: string;
  name: string;
  kind: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  urgency: Urgency;
  key: boolean;
  priority_score: number;
  time_estimate_min: number | null;
  tags: string[];
  due_date: string | null;
  owner: string | null;
  entity_id: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type CaptureKind = "task" | "journal" | "note" | "decision";

export interface Classification {
  kind: CaptureKind;
  urgency: Urgency;
  entity_id: string | null;
  tags: string[];
  summary: string;
}

export interface RawCapture {
  id: string;
  user_id: string;
  source: "telegram" | "web";
  raw_text: string;
  audio_url: string | null;
  classification: Classification | null;
  llm_source: "anthropic" | "openai" | "regex" | null;
  routed_to: string | null;
  routed_id: string | null;
  created_at: string;
}

export interface HabitState {
  done: string[];
  total: number;
}

export interface Meal {
  id: string;
  t: string;
  n: string;
  kcal: number;
  p: number;
  c: number;
  f: number;
  estimated: boolean;
}

export interface GoalItem {
  id: string;
  text: string;
  done: boolean;
}

export interface FinanceSnapshot {
  net_worth: number;
  currency: string;
  as_of: string;
  categories: { name: string; value: number }[];
  notes?: string;
}

export interface DailyLogNotes {
  habits?: HabitState;
  nutrition?: { meals: Meal[] };
  goals_week_items?: GoalItem[];
  goals_month_items?: GoalItem[];
  finance?: FinanceSnapshot;
}

export interface DailyLog {
  id: string;
  user_id: string;
  log_date: string;
  notes: DailyLogNotes;
  mood: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemoryChunk {
  id: string;
  user_id: string;
  source_type: string;
  source_id: string;
  text: string;
  created_at: string;
}

/** Sentinel date goals are stored on, so week/month rollovers never clear them. */
export const GOALS_SENTINEL_DATE = "2000-01-01";
