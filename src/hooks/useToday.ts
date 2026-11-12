import { useSyncExternalStore } from "react";
import { msUntilMidnight, todayISO } from "@/lib/date";

const HOUR = 60 * 60 * 1000;

// Re-check the date at Pacific midnight, and whenever the page becomes
// visible again (a sleeping tablet misses its timers).
function subscribe(onChange: () => void) {
  let timer: ReturnType<typeof setTimeout>;
  // Wake at least hourly: on a DST day wall-clock time to midnight isn't
  // real time, but the change is at 2am, so the last hour is always exact.
  const schedule = () => {
    timer = setTimeout(() => {
      onChange();
      schedule();
    }, Math.min(msUntilMidnight(), HOUR));
  };
  schedule();
  document.addEventListener("visibilitychange", onChange);

  return () => {
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", onChange);
  };
}

// Today's Pacific date (YYYY-MM-DD), updating when the day changes.
// null while server rendering, so a prerendered page never shows the
// build date.
export function useToday(): string | null {
  return useSyncExternalStore(subscribe, () => todayISO(), () => null);
}
