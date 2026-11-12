import { createPortal } from "react-dom";
import { Box } from "@mantine/core";
import type { StaffMember } from "@/data/staff";
import type { RoomStatuses } from "@/data/status";
import { PrintSheet } from "./PrintSheet";
import classes from "./PrintSheets.module.css";

type PrintSheetsProps = {
  // In print order
  members: (StaffMember & { id: number })[];
  date: string;
  statuses: RoomStatuses;
  // Staff id assigned to each room
  assignments: Partial<Record<number, number>>;
};

// Every picked person's sheet as one print job. Rendered straight into
// <body> so print CSS can hide the whole app around it. Client only.
// A housekeeper with at least one assigned room gets their own sheet with
// those rows shaded; everyone else gets the general sheet.
export function PrintSheets({ members, date, statuses, assignments }: PrintSheetsProps) {
  return createPortal(
    <Box className={classes.root}>
      {members.map((member) => {
        const rooms = Object.keys(statuses)
          .map(Number)
          .filter((number) => assignments[number] === member.id);
        const assigned =
          member.role === "housekeeper" && rooms.length > 0 ? new Set(rooms) : undefined;
        return (
          <PrintSheet
            key={member.id}
            member={member}
            date={date}
            statuses={statuses}
            assigned={assigned}
          />
        );
      })}
    </Box>,
    document.body,
  );
}
