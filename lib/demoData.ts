import type { FinanceSnapshot, GoalItem, HabitState, Meal, Task } from "@/lib/types";

/** Fake-but-realistic data for demo mode. Never touches the real DB. */

export function demoTasks(): Task[] {
  const now = new Date().toISOString();
  const mk = (over: Partial<Task>): Task => ({
    id: crypto.randomUUID(),
    user_id: "demo",
    title: "Untitled",
    description: null,
    urgency: "today",
    key: false,
    priority_score: 0,
    time_estimate_min: null,
    tags: [],
    due_date: null,
    owner: null,
    entity_id: null,
    completed_at: null,
    created_at: now,
    updated_at: now,
    ...over,
  });

  return [
    mk({ title: "Reply to Acme proposal", urgency: "today", key: true, priority_score: 90, time_estimate_min: 20 }),
    mk({ title: "Ship dashboard v2", urgency: "today", key: true, priority_score: 85, time_estimate_min: 90 }),
    mk({ title: "Book dentist", urgency: "today", key: false, priority_score: 40, time_estimate_min: 5 }),
    mk({ title: "Renew passport", urgency: "this_week", key: false, priority_score: 60 }),
    mk({ title: "Plan Q3 offsite", urgency: "this_month", key: false, priority_score: 30 }),
    mk({ title: "Learn Rust", urgency: "someday", key: false, priority_score: 10 }),
  ];
}

export function demoHabits(): HabitState {
  return { done: ["Read", "Gym", "No sugar"], total: 6 };
}

export function demoMeals(): Meal[] {
  return [
    { id: "1", t: "08:10", n: "Oats + berries", kcal: 420, p: 14, c: 68, f: 9, estimated: true },
    { id: "2", t: "13:00", n: "Chicken bowl", kcal: 680, p: 52, c: 60, f: 20, estimated: true },
  ];
}

export function demoGoals(): { week: GoalItem[]; month: GoalItem[] } {
  return {
    week: [
      { id: "1", text: "Ship the finance card", done: false },
      { id: "2", text: "3 gym sessions", done: true },
    ],
    month: [
      { id: "3", text: "Launch Personal OS v1", done: false },
      { id: "4", text: "Read 2 books", done: false },
    ],
  };
}

export function demoFinance(): FinanceSnapshot {
  return {
    net_worth: 84250,
    currency: "USD",
    as_of: new Date().toISOString().slice(0, 10),
    categories: [
      { name: "Cash", value: 12000 },
      { name: "Investments", value: 61000 },
      { name: "Crypto", value: 4250 },
      { name: "Debt", value: -7000 },
    ],
  };
}
