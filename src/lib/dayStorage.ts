import { ROOMS } from "@/data/rooms";
import { STAFF } from "@/data/staff";
import type { RoomStatus, RoomStatuses } from "@/data/status";
import { STATUS_LABEL } from "@/data/status";
import type { DayState } from "@/lib/day";
import { isEmptyDay } from "@/lib/day";

// Same key as reference/index.html
const KEY = "monarch-hk-draft";

const ROOM_NUMBERS = new Set(ROOMS.map((room) => room.number));
const STAFF_NAMES = new Set(STAFF.map((member) => member.name));
const isStatus = (value: unknown): value is RoomStatus =>
  typeof value === "string" && value in STATUS_LABEL;

// Storage can throw (private mode, blocked site data, quota). Never let
// that break the page: reads fall back to nothing, writes are dropped.
function read(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function write(value: string) {
  try {
    localStorage.setItem(KEY, value);
  } catch {}
}

function remove() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

// The saved day for `date`, or null if there's none, it's for another
// day, or it can't be read. Unknown rooms, statuses and names are dropped.
export function loadDay(date: string): DayState | null {
  const raw = read();
  if (raw === null) return null;

  let saved: unknown;
  try {
    saved = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof saved !== "object" || saved === null) return null;
  const { date: savedDate, statuses, staff } = saved as Record<string, unknown>;
  if (savedDate !== date) return null;

  const restored: RoomStatuses = {};
  if (typeof statuses === "object" && statuses !== null) {
    for (const [number, status] of Object.entries(statuses)) {
      if (ROOM_NUMBERS.has(Number(number)) && isStatus(status)) {
        restored[Number(number)] = status;
      }
    }
  }

  const picked = Array.isArray(staff)
    ? [...new Set(staff.filter((name) => STAFF_NAMES.has(name)))]
    : [];

  return { date, statuses: restored, staff: picked };
}

// Keep the saved copy in step with the day. An empty day removes it: after
// Clear, the midnight rollover, or a load that discarded another day's copy.
export function saveDay(day: DayState) {
  if (day.date === null) return;
  if (isEmptyDay(day)) {
    remove();
  } else {
    write(JSON.stringify(day));
  }
}

