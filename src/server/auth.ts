"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { and, eq, gt, isNull, lte, or, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db";
import { authLockout } from "@/db/schema";
import { nextMidnight } from "@/lib/date";
import { SESSION_COOKIE, signSession } from "@/lib/session";

const MAX_ATTEMPTS = 10;
const LOCK_MINUTES = 15;

export type VerifyPinResult =
  | { ok: true }
  | { ok: false; error: "wrongPin" }
  | { ok: false; error: "locked"; lockedUntil: Date };

function deskPin(): string {
  const pin = process.env.DESK_PIN;
  if (!pin || !/^\d{6}$/.test(pin)) throw new Error("DESK_PIN must be set to 6 digits");
  return pin;
}

// Constant time whatever the input: compare fixed-length hashes
function pinMatches(pin: string): boolean {
  const hash = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(hash(pin), hash(deskPin()));
}

// The lockout is shared by every device. After MAX_ATTEMPTS wrong PINs in
// a row, nobody can sign in for LOCK_MINUTES; the count then starts over.
// A right PIN signs this device in until the next Pacific midnight.
export async function verifyPin(pin: string): Promise<VerifyPinResult> {
  const notLocked = or(isNull(authLockout.lockedUntil), lte(authLockout.lockedUntil, sql`now()`));

  const [locked] = await db
    .select({ lockedUntil: authLockout.lockedUntil })
    .from(authLockout)
    .where(and(eq(authLockout.id, 1), gt(authLockout.lockedUntil, sql`now()`)));
  if (locked?.lockedUntil) return { ok: false, error: "locked", lockedUntil: locked.lockedUntil };

  if (typeof pin === "string" && pinMatches(pin)) {
    await db
      .update(authLockout)
      .set({ failedAttempts: 0 })
      .where(and(eq(authLockout.id, 1), notLocked));
    const expires = nextMidnight();
    (await cookies()).set(SESSION_COOKIE, await signSession(expires), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      expires,
    });
    return { ok: true };
  }

  // One statement, so simultaneous wrong tries from several devices all
  // count. Matches nothing if another device's try just locked it.
  const reachesMax = sql`${authLockout.failedAttempts} + 1 >= ${MAX_ATTEMPTS}`;
  const [after] = await db
    .update(authLockout)
    .set({
      failedAttempts: sql`case when ${reachesMax} then 0 else ${authLockout.failedAttempts} + 1 end`,
      lockedUntil: sql`case when ${reachesMax} then now() + make_interval(mins => ${LOCK_MINUTES}) else ${authLockout.lockedUntil} end`,
    })
    .where(and(eq(authLockout.id, 1), notLocked))
    .returning({ lockedUntil: authLockout.lockedUntil });

  if (!after) {
    const [row] = await db
      .select({ lockedUntil: authLockout.lockedUntil })
      .from(authLockout)
      .where(eq(authLockout.id, 1));
    return { ok: false, error: "locked", lockedUntil: row.lockedUntil! };
  }
  if (after.lockedUntil && after.lockedUntil > new Date()) {
    return { ok: false, error: "locked", lockedUntil: after.lockedUntil };
  }
  return { ok: false, error: "wrongPin" };
}
