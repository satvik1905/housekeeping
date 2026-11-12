import { useSyncExternalStore } from "react";
import { todayISO } from "@/lib/date";

const subscribe = () => () => {};

// Today's date (YYYY-MM-DD) from the browser's clock. null while server
// rendering, so a prerendered page never shows the build date.
export function useToday(): string | null {
  return useSyncExternalStore(subscribe, todayISO, () => null);
}
