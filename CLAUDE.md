# Project rules

Every task in this repo must follow these rules.

## UI

- Mantine components only. No Tailwind, no inline style props, no hardcoded colors.
- Custom components (room tile, printed sheet) are built from Mantine primitives and take every color, radius and spacing value from the theme.
- Light mode only.

## Spacing

Use theme tokens only, never raw px.

- `xs` = 8px: inside a component
- `md` = 16px: between items
- `lg` = 24px: page padding
- `xl` = 32px: between sections
- Don't use `sm` or any value outside these.
- Items that together form one list or control (nav items, chip groups, list rows) count as inside a component and use `xs`. `md` is only for separate cards and blocks.

## Touch

- Anything tappable is at least 44px tall.

## Layout

- Screens are assembled only from shared layout components (`Page`, `PageHeader`, `Section`) plus `Stack`/`Group` using the tokens above. No screen sets its own padding or gaps.
- Build a shared component once and reuse it. Never rebuild one by hand on another screen.

## Source of truth

- `reference/index.html` holds the current rooms, bed types, staff, checklist, sheet layout and behaviors. Port from it; don't reinvent.
- Never introduce a value, behavior or copy that isn't specified. If something is missing, stop and ask.

## Domain rules

- Staff roles: housekeeper, laundry, maintenance. Everyone working is picked daily.
- Only housekeepers can be assigned rooms. Only housekeepers count in analytics.
- Laundry and maintenance always get the plain sheet: all 55 rooms, C/O ✗, S/O ○, "Room Service" in Comment, no shading. This is the same as "Print as is".
- Every sheet gets the checklist and the 40-minute reminder, whatever the role.
- Sheet name field label: "HOUSEKEEPER" for housekeepers, "NAME" for laundry and maintenance.
