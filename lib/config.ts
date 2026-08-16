export const USER_ID = process.env.USER_ID ?? "me";
export const USER_TIMEZONE = process.env.USER_TIMEZONE ?? "UTC";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export function supabaseUrl(): string {
  return required("NEXT_PUBLIC_SUPABASE_URL");
}

export function supabaseServiceRoleKey(): string {
  return required("SUPABASE_SERVICE_ROLE_KEY");
}

export function anthropicApiKey(): string | undefined {
  return process.env.ANTHROPIC_API_KEY;
}

export function anthropicModel(): string {
  return process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
}

export function openaiApiKey(): string | undefined {
  return process.env.OPENAI_API_KEY;
}

export function openaiClassifierModel(): string {
  return process.env.OPENAI_CLASSIFIER_MODEL ?? "gpt-4o-mini";
}

export function authSecret(): string {
  return required("AUTH_SECRET");
}

export function dashboardPassword(): string {
  return required("DASHBOARD_PASSWORD");
}

export function apiSecret(): string | undefined {
  return process.env.API_SECRET;
}

export function cronSecret(): string | undefined {
  return process.env.CRON_SECRET;
}
