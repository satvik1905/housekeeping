// Ported from reference/index.html (STAFF), in the same order.
// Eloy is left out: he's maintenance, not housekeeping.
export const HOUSEKEEPERS = [
  "Maria",
  "Mari",
  "Mabel",
  "Isabel",
  "Peya",
  "Berta",
  "Jose",
  "Ivan",
] as const;

export type Housekeeper = (typeof HOUSEKEEPERS)[number];
