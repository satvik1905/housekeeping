// The hotel's day runs on Pacific time, whatever the device's time zone.
export const TIME_ZONE = "America/Los_Angeles";

const partsFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function pacificParts(now: Date) {
  const parts: Record<string, number> = {};
  for (const { type, value } of partsFormat.formatToParts(now)) {
    if (type !== "literal") parts[type] = Number(value);
  }
  return parts;
}

// Today's date in Pacific time, as YYYY-MM-DD
export function todayISO(now = new Date()): string {
  const { year, month, day } = pacificParts(now);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// Wall-clock time left until the next Pacific midnight
export function msUntilMidnight(now = new Date()): number {
  const { hour, minute, second } = pacificParts(now);
  const elapsed = ((hour * 60 + minute) * 60 + second) * 1000 + now.getMilliseconds();
  return 24 * 60 * 60 * 1000 - elapsed;
}

// Ported from reference/index.html (prettyDate).
// "2026-11-02" -> "Monday Nov 2, 2026"
export function prettyDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const wd = dt.toLocaleDateString("en-US", { weekday: "long" });
  const mo = dt.toLocaleDateString("en-US", { month: "short" });
  return `${wd} ${mo} ${d}, ${y}`;
}
