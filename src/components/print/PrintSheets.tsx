import { createPortal } from "react-dom";
import { Box } from "@mantine/core";
import type { StaffMember } from "@/data/staff";
import type { RoomStatuses } from "@/data/status";
import { PrintSheet } from "./PrintSheet";
import classes from "./PrintSheets.module.css";

type PrintSheetsProps = {
  // In print order
  members: StaffMember[];
  date: string;
  statuses: RoomStatuses;
};

// Every picked person's sheet as one print job. Rendered straight into
// <body> so print CSS can hide the whole app around it. Client only.
export function PrintSheets({ members, date, statuses }: PrintSheetsProps) {
  return createPortal(
    <Box className={classes.root}>
      {members.map((member) => (
        <PrintSheet key={member.name} member={member} date={date} statuses={statuses} />
      ))}
    </Box>,
    document.body,
  );
}
