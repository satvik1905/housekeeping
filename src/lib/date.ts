// Ported from reference/index.html (todayISO, prettyDate). Local time.

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// "2026-11-02" -> "Monday Nov 2, 2026"
export function prettyDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const wd = dt.toLocaleDateString("en-US", { weekday: "long" });
  const mo = dt.toLocaleDateString("en-US", { month: "short" });
  return `${wd} ${mo} ${d}, ${y}`;
}
