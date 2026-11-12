import { Box } from "@mantine/core";
import { CHECKLIST_COLUMNS, CHECKLIST_REMINDER } from "@/data/checklist";
import type { Floor, Room } from "@/data/rooms";
import { ROOMS } from "@/data/rooms";
import type { StaffMember } from "@/data/staff";
import type { RoomStatuses } from "@/data/status";
import { prettyDate } from "@/lib/date";
import classes from "./PrintSheet.module.css";

// Header columns, ported from reference/index.html (English + Spanish)
const COLUMNS: { label: string; subheading?: string }[] = [
  { label: "Room Number", subheading: "Número de habitación" },
  { label: "Bed Type", subheading: "Tipo de cama" },
  { label: "C/O" },
  { label: "S/O" },
  { label: "Comment", subheading: "Comentarios" },
  { label: "Check Room", subheading: "Revisar habitación" },
  { label: "Cleaned By", subheading: "Limpiado por" },
  { label: "Inspected By", subheading: "Inspeccionado por" },
];

type PrintSheetProps = {
  member: StaffMember;
  // Pacific date, YYYY-MM-DD
  date: string;
  statuses: RoomStatuses;
};

// One person's sheet: two pages, floor 1 (with the reminder and
// checklist) then floor 2, exactly as in the reference. Same layout for
// every role; only the name field label differs (CLAUDE.md, Domain rules).
export function PrintSheet({ member, date, statuses }: PrintSheetProps) {
  return (
    <>
      <SheetPage member={member} date={date} statuses={statuses} floor={1} withChecklist />
      <SheetPage member={member} date={date} statuses={statuses} floor={2} />
    </>
  );
}

type SheetPageProps = PrintSheetProps & {
  floor: Floor;
  withChecklist?: boolean;
};

function SheetPage({ member, date, statuses, floor, withChecklist }: SheetPageProps) {
  const nameLabel = member.role === "housekeeper" ? "HOUSEKEEPER" : "NAME";

  return (
    <Box className={classes.page}>
      {/* eslint-disable-next-line @next/next/no-img-element -- print needs a plain img */}
      <img className={classes.logo} src="/monarch-logo.png" alt="" />
      <Box className={classes.title}>Housekeeping Sheet</Box>

      <Box className={classes.fields}>
        <Box className={classes.field}>
          DATE <span className={`${classes.value} ${classes.dateValue}`}>{prettyDate(date)}</span>
        </Box>
        <Box className={`${classes.field} ${classes.nameField}`}>
          {nameLabel} <span className={classes.value}>{member.name}</span>
        </Box>
      </Box>

      <Box component="table" className={classes.table}>
        <colgroup>
          {COLUMNS.map(({ label }) => (
            <col key={label} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {COLUMNS.map(({ label, subheading }) => (
              <th key={label}>
                {label}
                {subheading && <span className={classes.subheading}>{subheading}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROOMS.filter((room) => room.floor === floor).map((room) => (
            <SheetRow key={room.number} room={room} status={statuses[room.number]} />
          ))}
        </tbody>
      </Box>

      {withChecklist && (
        <>
          <Box className={classes.note}>{CHECKLIST_REMINDER}</Box>
          <Box className={classes.checklistHeading}>CHECKLIST</Box>
          <Box className={classes.checklist}>
            {CHECKLIST_COLUMNS.map((column, i) => (
              <div key={i}>
                {column.map((item) => (
                  <div key={item} className={classes.checklistItem}>
                    <span className={classes.blank} />
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}

type SheetRowProps = {
  room: Room;
  status: RoomStatuses[number];
};

// C/O gets ✗; S/O gets ○ for both stayover kinds; room service is noted
// in Comment, as in the reference
function SheetRow({ room, status }: SheetRowProps) {
  const isStayover = status === "stayover" || status === "stayoverRoomService";

  return (
    <tr>
      <td className={classes.number}>{room.number}</td>
      <td className={classes.bedType}>{room.bedType}</td>
      <td className={classes.mark}>{status === "checkout" ? "✗" : ""}</td>
      <td className={classes.mark}>{isStayover && <span className={classes.circle} />}</td>
      <td className={classes.comment}>
        {status === "stayoverRoomService" ? "Room Service" : ""}
      </td>
      <td />
      <td />
      <td />
    </tr>
  );
}
