"use server";

import { redirect } from "next/navigation";
import type { RoomStatus } from "@/data/status";
import { hasSession } from "@/lib/session";
import type { Today, WriteResult } from "./todayData";
import * as data from "./todayData";

// The Today screen's server actions. Each checks the session itself: the
// proxy alone isn't enough, since an action can be posted to any route.
// Without a session, the screen is sent to the PIN page.
async function requireSession() {
  if (!(await hasSession())) redirect("/login");
}

export async function getToday(): Promise<Today> {
  await requireSession();
  return data.getToday();
}

export async function setMark(
  date: string,
  roomNumber: number,
  status: RoomStatus | null,
): Promise<WriteResult> {
  await requireSession();
  return data.setMark(date, roomNumber, status);
}

export async function togglePick(date: string, staffId: number): Promise<WriteResult> {
  await requireSession();
  return data.togglePick(date, staffId);
}

export async function clearDay(date: string): Promise<WriteResult> {
  await requireSession();
  return data.clearDay(date);
}

export async function assignRoom(
  date: string,
  roomNumber: number,
  staffId: number | null,
): Promise<WriteResult> {
  await requireSession();
  return data.assignRoom(date, roomNumber, staffId);
}

export async function markPrinted(date: string, staffIds: number[]): Promise<WriteResult> {
  await requireSession();
  return data.markPrinted(date, staffIds);
}
