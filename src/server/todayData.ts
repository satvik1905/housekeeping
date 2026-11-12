// The Today screen's data, with no session check. Only the actions in
// ./today.ts (which check the session) and tests call these.
import "server-only";
import { and, asc, eq, gt, inArray, sql } from "drizzle-orm";
import { ROOMS } from "@/data/rooms";
import type { StaffRole } from "@/data/staff";
import type { RoomStatus, RoomStatuses } from "@/data/status";
import { STATUS_LABEL } from "@/data/status";
import { db } from "@/db";
import { dayStaff, roomAssignments, roomMarks, sheetPrints, staff } from "@/db/schema";
import { todayISO } from "@/lib/date";

export type TodayStaff = {
  id: number;
  name: string;
  role: StaffRole;
};

export type Today = {
  // Pacific date (YYYY-MM-DD)
  date: string;
  marks: RoomStatuses;
  // Picked staff, in pick order
  picks: TodayStaff[];
  // Everyone active, in staff order
  staff: TodayStaff[];
  // Staff id assigned to each room; unassigned rooms are absent
  assignments: Partial<Record<number, number>>;
  // When each person's sheet was last printed today, by staff id
  prints: Partial<Record<number, Date>>;
};

// A stale screen (still showing yesterday) is an expected case the UI must
// handle, so it's returned rather than thrown: Next hides thrown messages
// from the client in production. Invalid input is a bug and throws.
export type WriteResult = { ok: true } | { ok: false; error: "dayChanged"; today: string };

const staffColumns = { id: staff.id, name: staff.name, role: staff.role };

export async function getToday(): Promise<Today> {
  const date = todayISO();
  const [markRows, picks, activeStaff, assignmentRows, printRows] = await db.batch([
    db
      .select({ roomNumber: roomMarks.roomNumber, status: roomMarks.status })
      .from(roomMarks)
      .where(eq(roomMarks.date, date)),
    db
      .select(staffColumns)
      .from(dayStaff)
      .innerJoin(staff, eq(dayStaff.staffId, staff.id))
      .where(eq(dayStaff.date, date))
      .orderBy(asc(dayStaff.pickOrder)),
    db.select(staffColumns).from(staff).where(eq(staff.active, true)).orderBy(asc(staff.id)),
    db
      .select({ roomNumber: roomAssignments.roomNumber, staffId: roomAssignments.staffId })
      .from(roomAssignments)
      .where(eq(roomAssignments.date, date)),
    db
      .select({ staffId: sheetPrints.staffId, printedAt: sheetPrints.printedAt })
      .from(sheetPrints)
      .where(eq(sheetPrints.date, date)),
  ]);

  const marks: RoomStatuses = {};
  for (const { roomNumber, status } of markRows) marks[roomNumber] = status;
  const assignments: Today["assignments"] = {};
  for (const { roomNumber, staffId } of assignmentRows) assignments[roomNumber] = staffId;
  const prints: Today["prints"] = {};
  for (const { staffId, printedAt } of printRows) prints[staffId] = printedAt;

  return { date, marks, picks, staff: activeStaff, assignments, prints };
}

export async function setMark(
  date: string,
  roomNumber: number,
  status: RoomStatus | null,
): Promise<WriteResult> {
  if (!ROOMS.some((room) => room.number === roomNumber)) {
    throw new Error(`No room ${roomNumber}`);
  }
  if (status !== null && !Object.hasOwn(STATUS_LABEL, status)) {
    throw new Error(`Invalid status ${status}`);
  }
  const stale = dayChanged(date);
  if (stale) return stale;

  if (status === null) {
    // Its assignment goes with it (foreign key cascade)
    await db
      .delete(roomMarks)
      .where(and(eq(roomMarks.date, date), eq(roomMarks.roomNumber, roomNumber)));
  } else {
    await db
      .insert(roomMarks)
      .values({ date, roomNumber, status })
      .onConflictDoUpdate({ target: [roomMarks.date, roomMarks.roomNumber], set: { status } });
  }
  return { ok: true };
}

// Same as the reference: picking adds the person at the end; unpicking
// removes them and moves everyone picked after them up by one.
// Picking requires an active staff member; unpicking doesn't, so someone
// deactivated after being picked can still be removed.
export async function togglePick(date: string, staffId: number): Promise<WriteResult> {
  if (!Number.isInteger(staffId)) throw new Error(`Invalid staff id ${staffId}`);
  const stale = dayChanged(date);
  if (stale) return stale;

  const [picked] = await db
    .select({ pickOrder: dayStaff.pickOrder })
    .from(dayStaff)
    .where(and(eq(dayStaff.date, date), eq(dayStaff.staffId, staffId)));

  if (picked) {
    // One transaction: remove the pick, renumber only those after it.
    // Their room assignments go with the pick (foreign key cascade).
    await db.batch([
      db
        .delete(dayStaff)
        .where(and(eq(dayStaff.date, date), eq(dayStaff.staffId, staffId))),
      db
        .update(dayStaff)
        .set({ pickOrder: sql`${dayStaff.pickOrder} - 1` })
        .where(and(eq(dayStaff.date, date), gt(dayStaff.pickOrder, picked.pickOrder))),
    ]);
  } else {
    // Only active staff can be picked; anyone picked can be unpicked
    const [member] = await db
      .select({ id: staff.id })
      .from(staff)
      .where(and(eq(staff.id, staffId), eq(staff.active, true)));
    if (!member) throw new Error(`No active staff member ${staffId}`);

    // Next pick number computed in the same statement as the insert
    await db.insert(dayStaff).values({
      date,
      staffId,
      pickOrder: sql`(select coalesce(max(${dayStaff.pickOrder}), 0) + 1 from ${dayStaff} where ${dayStaff.date} = ${date})`,
    });
  }
  return { ok: true };
}

export async function clearDay(date: string): Promise<WriteResult> {
  const stale = dayChanged(date);
  if (stale) return stale;

  // Assignments go with the marks and picks (foreign key cascade)
  await db.batch([
    db.delete(roomMarks).where(eq(roomMarks.date, date)),
    db.delete(dayStaff).where(eq(dayStaff.date, date)),
    db.delete(sheetPrints).where(eq(sheetPrints.date, date)),
  ]);
  return { ok: true };
}

// Assigns a room to a housekeeper, moves it to another, or (staffId null)
// unassigns it. Assigning needs the room marked and the person picked as
// a housekeeper today; both are checked in the same statement as the write.
export async function assignRoom(
  date: string,
  roomNumber: number,
  staffId: number | null,
): Promise<WriteResult> {
  if (!ROOMS.some((room) => room.number === roomNumber)) {
    throw new Error(`No room ${roomNumber}`);
  }
  if (staffId !== null && !Number.isInteger(staffId)) {
    throw new Error(`Invalid staff id ${staffId}`);
  }
  const stale = dayChanged(date);
  if (stale) return stale;

  if (staffId === null) {
    await db
      .delete(roomAssignments)
      .where(and(eq(roomAssignments.date, date), eq(roomAssignments.roomNumber, roomNumber)));
    return { ok: true };
  }

  const written = await db.execute(sql`
    insert into ${roomAssignments} (date, room_number, staff_id)
    select ${date}, ${roomNumber}, ${staffId}
    where exists (
      select 1 from ${roomMarks}
      where ${roomMarks.date} = ${date} and ${roomMarks.roomNumber} = ${roomNumber}
    )
    and exists (
      select 1 from ${dayStaff} join ${staff} on ${staff.id} = ${dayStaff.staffId}
      where ${dayStaff.date} = ${date} and ${dayStaff.staffId} = ${staffId}
        and ${staff.role} = 'housekeeper'
    )
    on conflict (date, room_number) do update set staff_id = excluded.staff_id
    returning 1
  `);
  if (written.rows.length > 0) return { ok: true };

  // Nothing written: say why
  const [[mark], [pick]] = await db.batch([
    db
      .select({ roomNumber: roomMarks.roomNumber })
      .from(roomMarks)
      .where(and(eq(roomMarks.date, date), eq(roomMarks.roomNumber, roomNumber))),
    db
      .select({ role: staff.role })
      .from(dayStaff)
      .innerJoin(staff, eq(dayStaff.staffId, staff.id))
      .where(and(eq(dayStaff.date, date), eq(dayStaff.staffId, staffId))),
  ]);
  if (!mark) throw new Error(`Room ${roomNumber} isn't marked`);
  if (!pick) throw new Error(`Staff member ${staffId} isn't picked`);
  throw new Error(`Staff member ${staffId} isn't a housekeeper`);
}

// Records that these people's sheets were printed now, replacing any
// earlier time today
export async function markPrinted(date: string, staffIds: number[]): Promise<WriteResult> {
  if (!Array.isArray(staffIds) || !staffIds.every((id) => Number.isInteger(id))) {
    throw new Error("Invalid staff ids");
  }
  const stale = dayChanged(date);
  if (stale) return stale;
  if (staffIds.length === 0) return { ok: true };

  const ids = [...new Set(staffIds)];
  const found = await db.select({ id: staff.id }).from(staff).where(inArray(staff.id, ids));
  if (found.length !== ids.length) throw new Error("Unknown staff id");

  await db
    .insert(sheetPrints)
    .values(ids.map((staffId) => ({ date, staffId, printedAt: sql`now()` })))
    .onConflictDoUpdate({
      target: [sheetPrints.date, sheetPrints.staffId],
      set: { printedAt: sql`excluded.printed_at` },
    });
  return { ok: true };
}

// Every write names the day the screen shows; reject it if that's no longer
// today in Pacific time
function dayChanged(date: string): WriteResult | null {
  const today = todayISO();
  return date === today ? null : { ok: false, error: "dayChanged", today };
}
