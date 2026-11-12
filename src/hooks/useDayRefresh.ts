import { useEffect, useEffectEvent } from "react";
import { msUntilMidnight, todayISO } from "@/lib/date";

const HOUR = 60 * 60 * 1000;

// Calls refresh when the page becomes visible again (a sleeping tablet may
// have missed changes and its timers) and when Pacific midnight passes
// `date`, the day on screen.
export function useDayRefresh(date: string, refresh: () => void) {
  const onWake = useEffectEvent(() => {
    if (document.visibilityState === "visible") refresh();
  });
  const onTimer = useEffectEvent(() => {
    if (todayISO() !== date) refresh();
  });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    // Wake at least hourly: on a DST day wall-clock time to midnight isn't
    // real time, but the change is at 2am, so the last hour is always exact.
    const schedule = () => {
      timer = setTimeout(() => {
        onTimer();
        schedule();
      }, Math.min(msUntilMidnight(), HOUR));
    };
    schedule();
    document.addEventListener("visibilitychange", onWake);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onWake);
    };
  }, []);
}
