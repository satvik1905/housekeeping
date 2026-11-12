// Ported from reference/index.html (CHECKLIST and the printed sheet note).
// Wording copied exactly; columns and items in their current order.
export const CHECKLIST_COLUMNS = [
  [
    "Check drawers",
    "Check closets",
    "Check lights",
    "Close windows",
    "Turn off heater",
    "Turn off TV alarm",
  ],
  [
    "Elevator",
    "Public restroom",
    "Lobby (also windows)",
    "Coffee area",
    "Kitchen",
    "Vacuum all hallways",
  ],
  [
    "Office restroom",
    "Vacuum office carpet",
    "Poolside furniture",
    "Sweep entryway",
    "Clean windows",
    "Check phones",
  ],
] as const;

export const CHECKLIST_REMINDER =
  "Remember, no more than 40 mins per room, checkout or stayover.";
