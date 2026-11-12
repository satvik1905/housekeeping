"use server";

import { and, asc, eq, gt, sql } from "drizzle-orm";
import { ROOMS } from "@/data/rooms";
import type { StaffRole } from "@/data/staff";
import type { RoomStatus, RoomStatuses } from "@/data/status";
import { STATUS_LABEL } from "@/data/status";
import { db } from "@/db";
import { dayStaff, roomMarks, staff } from "@/db/schema";
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
};

// A stale screen (still showing yesterday) is an expected case the UI must
// handle, so it's returned rather than thrown: Next hides thrown messages
// from the client in production. Invalid input is a bug and throws.
export type WriteResult = { ok: true } | { ok: false; error: "dayChanged"; today: string };

const staffColumns = { id: staff.id, name: staff.name, role: staff.role };

export async function getToday(): Promise<Today> {
  const date = todayISO();
  const [markRows, picks, activeStaff] = await db.batch([
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
  ]);

  const marks: RoomStatuses = {};
  for (const { roomNumber, status } of markRows) marks[roomNumber] = status;

  return { date, marks, picks, staff: activeStaff };
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
    // One transaction: remove the pick, renumber only those after it
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

  await db.batch([
    db.delete(roomMarks).where(eq(roomMarks.date, date)),
    db.delete(dayStaff).where(eq(dayStaff.date, date)),
  ]);
  return { ok: true };
}

// Every write names the day the screen shows; reject it if that's no longer
// today in Pacific time
function dayChanged(date: string): WriteResult | null {
  const today = todayISO();
  return date === today ? null : { ok: false, error: "dayChanged", today };
}
