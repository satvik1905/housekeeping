import type { RoomStatuses } from "@/data/status";

// Everything that belongs to one day. A new Pacific date starts empty.
export type DayState = {
  // Pacific date (YYYY-MM-DD); null until known on the client
  date: string | null;
  statuses: RoomStatuses;
  // Names of picked staff, in the order picked
  staff: string[];
};

export const emptyDay = (date: string | null): DayState => ({
  date,
  statuses: {},
  staff: [],
});

export const isEmptyDay = (day: DayState) =>
  Object.keys(day.statuses).length === 0 && day.staff.length === 0;
