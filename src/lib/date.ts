/** End value for an ongoing period. */
export const PRESENT = "present";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_YEAR = /^(0[1-9]|1[0-2])\/(\d{4})$/;

function parse(value: string): { month: number; year: number } {
  const match = MONTH_YEAR.exec(value);
  if (!match) throw new Error(`Invalid month "${value}" (expected MM/YYYY)`);
  return { month: Number(match[1]), year: Number(match[2]) };
}

/** "09/2025" → "Sep 2025"; "present" → "Present"; a bare year is kept. */
export function formatMonth(value: string): string {
  if (value === PRESENT) return "Present";
  if (/^\d{4}$/.test(value)) return value;
  const { month, year } = parse(value);
  return `${MONTHS[month - 1]} ${year}`;
}

/** Absolute month number, so differences are month counts. */
export function monthIndex(value: string): number {
  const { month, year } = parse(value);
  return year * 12 + (month - 1);
}

/** Month index for a Date (local time). */
export function monthIndexOf(date: Date): number {
  return date.getFullYear() * 12 + date.getMonth();
}

/**
 * Inclusive month count, as LinkedIn shows it (Mar–Aug = 6 mos).
 * `current` is required when `end` is "present".
 */
export function monthsBetween(start: string, end: string, current?: number): number {
  const endIndex = end === PRESENT ? current : monthIndex(end);
  if (endIndex === undefined)
    throw new Error("monthsBetween: current month required for 'present'");
  return endIndex - monthIndex(start) + 1;
}

/** 14 → "1 yr 2 mos". */
export function formatDuration(months: number): string {
  if (!Number.isInteger(months) || months < 1) throw new Error(`Invalid duration: ${months}`);
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [];
  if (years) parts.push(`${years} ${years === 1 ? "yr" : "yrs"}`);
  if (rest) parts.push(`${rest} ${rest === 1 ? "mo" : "mos"}`);
  return parts.join(" ");
}
