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
