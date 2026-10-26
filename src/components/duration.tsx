"use client";

import { useSyncExternalStore } from "react";
import { formatDuration, monthIndexOf, monthsBetween, PRESENT } from "@/lib/date";

const noSubscribe = () => () => {};
// Month granularity keeps the snapshot stable between renders.
const currentMonth = () => monthIndexOf(new Date());
const serverMonth = () => null;

/**
 * "1 yr 2 mos". Ongoing periods need today's date, which can't be read while
 * prerendering (Cache Components), so they render on the client only.
 */
interface DurationProps {
  start: string;
  end: string;
  /** Rendered before the value only when a value is shown (e.g. " · "). */
  prefix?: string;
}

export function Duration({ start, end, prefix = "" }: DurationProps) {
  const current = useSyncExternalStore(noSubscribe, currentMonth, serverMonth);
  if (end !== PRESENT) return <>{prefix + formatDuration(monthsBetween(start, end))}</>;
  if (current === null) return null;
  return <>{prefix + formatDuration(monthsBetween(start, end, current))}</>;
}
