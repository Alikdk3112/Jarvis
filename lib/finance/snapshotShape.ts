import type { FinanceSnapshot } from "@/lib/types";

/**
 * A finance snapshot is unvalidated model output that then round-trips
 * through a JSON column, so by the time the card renders it, nothing has
 * checked its shape. A bad `currency` makes `toLocaleString` throw a
 * RangeError and a missing `categories` throws on `.map` — both of which
 * take down the whole client component. These two helpers make a malformed
 * snapshot degrade instead.
 */

/** ISO 4217 codes are three letters; anything else makes Intl throw. */
function isCurrencyCode(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z]{3}$/.test(value);
}

function finiteNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

/** Formats an amount, falling back to a plain number if the code is unusable. */
export function formatMoney(value: number, currency: string | undefined): string {
  const amount = finiteNumber(value);
  return isCurrencyCode(currency)
    ? amount.toLocaleString(undefined, { style: "currency", currency: currency.toUpperCase() })
    : amount.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/** Coerces arbitrary JSON into a renderable snapshot, or null if it isn't one. */
export function normalizeFinanceSnapshot(raw: unknown): FinanceSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const value = raw as Record<string, unknown>;

  const categories = Array.isArray(value.categories)
    ? value.categories
        .filter((c): c is Record<string, unknown> => Boolean(c) && typeof c === "object")
        .map((c) => ({
          name: typeof c.name === "string" && c.name.trim() ? c.name : "(unnamed)",
          value: finiteNumber(c.value),
        }))
    : [];

  return {
    net_worth: finiteNumber(value.net_worth),
    // Kept as-is rather than defaulted to an invented code — formatMoney
    // renders a bare number when it isn't a usable ISO 4217 code.
    currency: isCurrencyCode(value.currency) ? value.currency.toUpperCase() : "",
    as_of: typeof value.as_of === "string" ? value.as_of : "",
    categories,
    ...(typeof value.notes === "string" ? { notes: value.notes } : {}),
  };
}
