import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  foreignKey,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Same values as StaffRole in src/data/staff.ts
export const staffRole = pgEnum("staff_role", ["housekeeper", "laundry", "maintenance"]);

// Same values as RoomStatus in src/data/status.ts
export const roomStatus = pgEnum("room_status", [
  "checkout",
  "stayover",
  "stayoverRoomService",
]);

export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: staffRole("role").notNull(),
  active: boolean("active").notNull().default(true),
});

// Dates are the hotel's Pacific date (todayISO in src/lib/date.ts), YYYY-MM-DD.
// Rooms aren't in the database; room_number matches src/data/rooms.ts.
export const roomMarks = pgTable(
  "room_marks",
  {
    date: date("date", { mode: "string" }).notNull(),
    roomNumber: integer("room_number").notNull(),
    status: roomStatus("status").notNull(),
  },
  (table) => [primaryKey({ columns: [table.date, table.roomNumber] })],
);

export const dayStaff = pgTable(
  "day_staff",
  {
    date: date("date", { mode: "string" }).notNull(),
    staffId: integer("staff_id")
      .notNull()
      .references(() => staff.id),
    pickOrder: integer("pick_order").notNull(),
  },
  (table) => [primaryKey({ columns: [table.date, table.staffId] })],
);

// PIN lockout, shared by every device: a single row (id is always 1),
// created by the migration
export const authLockout = pgTable(
  "auth_lockout",
  {
    id: integer("id").primaryKey().default(1),
    failedAttempts: integer("failed_attempts").notNull().default(0),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
  },
  (table) => [check("auth_lockout_single_row", sql`${table.id} = 1`)],
);

// Which housekeeper cleans each marked room. Composite foreign keys make
// the database itself drop an assignment when its room is unmarked or its
// housekeeper is unpicked (and so when a day is cleared).
export const roomAssignments = pgTable(
  "room_assignments",
  {
    date: date("date", { mode: "string" }).notNull(),
    roomNumber: integer("room_number").notNull(),
    staffId: integer("staff_id").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.date, table.roomNumber] }),
    foreignKey({
      columns: [table.date, table.roomNumber],
      foreignColumns: [roomMarks.date, roomMarks.roomNumber],
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.date, table.staffId],
      foreignColumns: [dayStaff.date, dayStaff.staffId],
    }).onDelete("cascade"),
  ],
);

// The latest time each person's sheet was printed, per day
export const sheetPrints = pgTable(
  "sheet_prints",
  {
    date: date("date", { mode: "string" }).notNull(),
    staffId: integer("staff_id")
      .notNull()
      .references(() => staff.id),
    printedAt: timestamp("printed_at", { withTimezone: true }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.date, table.staffId] })],
);
