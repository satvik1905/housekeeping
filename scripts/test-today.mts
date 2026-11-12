// Tests the Today data functions (src/server/todayData.ts) against the database in .env.local.
// It clears today's marks and picks, so it only runs on the dev branch.
// Run with `npm run test:today`.
import type { RoomStatus } from "../src/data/status";
process.loadEnvFile(".env.local");
if (process.env.NEON_BRANCH !== "dev") {
  throw new Error(`Refusing to run: .env.local points at "${process.env.NEON_BRANCH}", not dev`);
}
const { getToday, setMark, togglePick, clearDay, assignRoom, markPrinted } = await import(
  "../src/server/todayData"
);
const { neon } = await import("@neondatabase/serverless");
const raw = neon(process.env.DATABASE_URL!);
let pass = 0, fail = 0;
const check = (name: string, cond: boolean, detail?: unknown) => {
  if (cond) pass++;
  else fail++;
  console.log(cond ? "PASS" : "FAIL", name, detail === undefined ? "" : JSON.stringify(detail));
};
const throws = async (name: string, fn: () => Promise<unknown>, re: RegExp) => {
  try {
    await fn();
    check(name, false, "did not throw");
  } catch (e) {
    const message = (e as Error).message;
    check(name, re.test(message), message);
  }
};
// Picks for a date as "staffId:pickOrder", in pick order
const picksOf = async (d: string) =>
  (await raw`select staff_id, pick_order from day_staff where date = ${d} order by pick_order`)
    .map((r) => `${r.staff_id}:${r.pick_order}`)
    .join(" ");
// Each pick row's xmin (changes whenever the row is written), by staff id
const xmin = async (d: string) =>
  Object.fromEntries(
    (await raw`select staff_id, xmin::text as x from day_staff where date = ${d}`).map((r) => [
      r.staff_id,
      r.x,
    ]),
  );

let t = await getToday();
const date = t.date;
const stale = new Date(Date.parse(date + "T12:00:00Z") - 86400000).toISOString().slice(0, 10);
console.log("today", date, "stale", stale);
await clearDay(date);
t = await getToday();
check("getToday: empty day", Object.keys(t.marks).length === 0 && t.picks.length === 0);
check("getToday: 9 active staff in order", t.staff.map((s) => s.name).join(",") === "Maria,Mari,Mabel,Isabel,Peya,Berta,Eloy,Jose,Ivan", t.staff.length);

check("setMark 101 checkout", (await setMark(date, 101, "checkout")).ok);
check("setMark 205 stayover", (await setMark(date, 205, "stayover")).ok);
check("setMark 101 -> stayoverRoomService (update)", (await setMark(date, 101, "stayoverRoomService")).ok);
t = await getToday();
check("marks read back", JSON.stringify(t.marks) === JSON.stringify({ 101: "stayoverRoomService", 205: "stayover" }), t.marks);
const before205 = (await raw`select xmin::text as x from room_marks where date=${date} and room_number=205`)[0].x;
check("setMark 101 null (remove)", (await setMark(date, 101, null)).ok);
t = await getToday();
check("101 removed, 205 kept", JSON.stringify(t.marks) === JSON.stringify({ 205: "stayover" }), t.marks);
const after205 = (await raw`select xmin::text as x from room_marks where date=${date} and room_number=205`)[0].x;
check("205 row untouched by 101 writes (xmin same)", before205 === after205);
check("setMark null on unmarked room is ok", (await setMark(date, 102, null)).ok);
await throws("setMark rejects room 103 (doesn't exist)", () => setMark(date, 103, "checkout"), /No room 103/);
await throws("setMark rejects bad status", () => setMark(date, 101, "dirty" as RoomStatus), /Invalid status/);

for (const id of [3, 1, 8, 5]) await togglePick(date, id);
check("pick 3,1,8,5 -> orders 1..4", (await picksOf(date)) === "3:1 1:2 8:3 5:4", await picksOf(date));
t = await getToday();
check("getToday picks in pick order", t.picks.map((p) => p.name).join(",") === "Mabel,Maria,Jose,Peya", t.picks.map((p) => p.name));
const x1 = await xmin(date);
await togglePick(date, 1);
check("unpick 1 -> 3:1 8:2 5:3", (await picksOf(date)) === "3:1 8:2 5:3", await picksOf(date));
const x2 = await xmin(date);
check("unpick touched only later picks (3 unchanged, 8 and 5 changed)", x1[3] === x2[3] && x1[8] !== x2[8] && x1[5] !== x2[5]);
await togglePick(date, 1);
check("re-pick 1 goes to end", (await picksOf(date)) === "3:1 8:2 5:3 1:4", await picksOf(date));
await togglePick(date, 1);
check("unpick last: nobody renumbered", (await picksOf(date)) === "3:1 8:2 5:3", await picksOf(date));
await throws("togglePick rejects staff 99", () => togglePick(date, 99), /No active staff member 99/);
await throws("togglePick rejects non-integer id", () => togglePick(date, 1.5), /Invalid staff id/);
await raw`update staff set active = false where id = 9`;
try {
  await throws("togglePick rejects inactive staff 9", () => togglePick(date, 9), /No active staff member 9/);
  t = await getToday();
  check("getToday omits inactive staff", t.staff.length === 8 && !t.staff.some((s) => s.id === 9));
} finally { await raw`update staff set active = true where id = 9`; }
// Pick 9 while active, deactivate, then unpick
await togglePick(date, 9);
check("pick 9 while active", (await picksOf(date)) === "3:1 8:2 5:3 9:4", await picksOf(date));
await togglePick(date, 1);
check("pick 1 after 9", (await picksOf(date)) === "3:1 8:2 5:3 9:4 1:5", await picksOf(date));
await raw`update staff set active = false where id = 9`;
try {
  const r = await togglePick(date, 9);
  check("unpick inactive picked 9 succeeds", r.ok, r);
  check("9 removed, 1 renumbered 5 -> 4", (await picksOf(date)) === "3:1 8:2 5:3 1:4", await picksOf(date));
  await throws("re-picking inactive 9 still rejected", () => togglePick(date, 9), /No active staff member 9/);
  check("rejected re-pick changed nothing", (await picksOf(date)) === "3:1 8:2 5:3 1:4", await picksOf(date));
  await togglePick(date, 1);
} finally { await raw`update staff set active = true where id = 9`; }

const before = { marks: await raw`select count(*)::int n from room_marks`, picks: await raw`select count(*)::int n from day_staff` };
const r1 = await setMark(stale, 101, "checkout");
check("stale setMark -> dayChanged", !r1.ok && r1.error === "dayChanged" && r1.today === date, r1);
const r2 = await togglePick(stale, 2);
check("stale togglePick -> dayChanged", !r2.ok && r2.error === "dayChanged", r2);
const r3 = await clearDay(stale);
check("stale clearDay -> dayChanged", !r3.ok && r3.error === "dayChanged", r3);
const r4 = await setMark("not-a-date", 101, "checkout");
check("garbage date -> dayChanged", !r4.ok && r4.error === "dayChanged", r4);
const after = { marks: await raw`select count(*)::int n from room_marks`, picks: await raw`select count(*)::int n from day_staff` };
check("stale writes changed nothing", JSON.stringify(before) === JSON.stringify(after), after);

// Room assignments. Picks now: 3 Mabel, 8 Jose (laundry), 5 Peya
const assigned = async (d: string) =>
  (await raw`select room_number, staff_id from room_assignments where date = ${d} order by room_number`)
    .map((r) => `${r.room_number}:${r.staff_id}`)
    .join(" ");
check("picks before assignments", (await picksOf(date)) === "3:1 8:2 5:3", await picksOf(date));
await setMark(date, 101, "checkout");
await setMark(date, 102, "stayover");
await setMark(date, 104, "stayoverRoomService");
check("assign 101 -> Mabel", (await assignRoom(date, 101, 3)).ok);
check("assign 102 -> Mabel", (await assignRoom(date, 102, 3)).ok);
check("assign 104 -> Peya", (await assignRoom(date, 104, 5)).ok);
check("assignments saved", (await assigned(date)) === "101:3 102:3 104:5", await assigned(date));
check("move 101 Mabel -> Peya", (await assignRoom(date, 101, 5)).ok);
check("moved (one row per room)", (await assigned(date)) === "101:5 102:3 104:5", await assigned(date));
check("unassign 102", (await assignRoom(date, 102, null)).ok);
check("unassigned", (await assigned(date)) === "101:5 104:5", await assigned(date));
check("unassign an unassigned room is ok", (await assignRoom(date, 102, null)).ok);
t = await getToday();
check("getToday returns assignments", JSON.stringify(t.assignments) === JSON.stringify({ 101: 5, 104: 5 }), t.assignments);

await throws("assign unmarked room 105 rejected", () => assignRoom(date, 105, 3), /Room 105 isn't marked/);
await throws("assign to laundry (Jose) rejected", () => assignRoom(date, 102, 8), /Staff member 8 isn't a housekeeper/);
await throws("assign to unpicked housekeeper (Maria) rejected", () => assignRoom(date, 102, 1), /Staff member 1 isn't picked/);
await throws("assign room 103 (doesn't exist) rejected", () => assignRoom(date, 103, 3), /No room 103/);
await throws("assign non-integer staff rejected", () => assignRoom(date, 102, 2.5), /Invalid staff id/);
check("rejections wrote nothing", (await assigned(date)) === "101:5 104:5", await assigned(date));
const rs = await assignRoom(stale, 101, 3);
check("stale assignRoom -> dayChanged", !rs.ok && rs.error === "dayChanged", rs);

// Cascade 1: unmarking a room deletes its assignment; changing its status keeps it
await setMark(date, 104, "checkout");
check("status change keeps assignment", (await assigned(date)) === "101:5 104:5", await assigned(date));
await setMark(date, 101, null);
check("unmark 101 deletes its assignment only", (await assigned(date)) === "104:5", await assigned(date));
// Cascade 2: unpicking a person deletes their assignments
await setMark(date, 101, "checkout");
await assignRoom(date, 101, 3);
await assignRoom(date, 102, 3);
check("setup: Mabel 101+102, Peya 104", (await assigned(date)) === "101:3 102:3 104:5", await assigned(date));
await togglePick(date, 3);
check("unpick Mabel deletes her assignments only", (await assigned(date)) === "104:5", await assigned(date));
check("unpick still renumbers", (await picksOf(date)) === "8:1 5:2", await picksOf(date));
await togglePick(date, 3);

// Print records
const printsOf = async (d: string) =>
  Object.fromEntries((await raw`select staff_id, printed_at from sheet_prints where date = ${d}`).map((r) => [r.staff_id, new Date(r.printed_at).getTime()]));
const t1 = Date.now();
check("markPrinted Peya + Jose", (await markPrinted(date, [5, 8])).ok);
const p1 = await printsOf(date);
check("print rows recorded at ~now", Object.keys(p1).sort().join() === "5,8" && Math.abs(p1[5] - t1) < 60_000, p1);
await new Promise((r) => setTimeout(r, 1100));
check("markPrinted Peya again", (await markPrinted(date, [5])).ok);
const p2 = await printsOf(date);
check("reprint replaces Peya's time, keeps Jose's", p2[5] > p1[5] && p2[8] === p1[8] && Object.keys(p2).length === 2);
check("markPrinted [] is a no-op", (await markPrinted(date, [])).ok);
await throws("markPrinted unknown staff rejected", () => markPrinted(date, [99]), /Unknown staff id/);
const rp = await markPrinted(stale, [5]);
check("stale markPrinted -> dayChanged", !rp.ok && rp.error === "dayChanged", rp);
t = await getToday();
check("getToday returns print times", t.prints[5] instanceof Date && t.prints[5].getTime() === p2[5] && t.prints[8] !== undefined, t.prints);

// Cascade 3: clearDay deletes assignments and print records (another date's survive)
await raw`insert into day_staff values (${stale}, 5, 1)`;
await raw`insert into sheet_prints values (${stale}, 5, now())`;
// another date's rows survive clearDay
await raw`insert into room_marks values (${stale}, 101, 'checkout')`;
check("clearDay today", (await clearDay(date)).ok);
t = await getToday();
check("today empty after clearDay", Object.keys(t.marks).length === 0 && t.picks.length === 0);
check("clearDay deleted assignments and prints", (await assigned(date)) === "" && Object.keys(await printsOf(date)).length === 0 && Object.keys(t.assignments).length === 0 && Object.keys(t.prints).length === 0);
check("clearDay left another date's prints alone", Object.keys(await printsOf(stale)).length === 1);
const other = await raw`select count(*)::int n from room_marks where date = ${stale}`;
check("clearDay left other dates alone", other[0].n === 1);
await raw`delete from room_marks where date = ${stale}`;
await raw`delete from sheet_prints where date = ${stale}`;
await raw`delete from day_staff where date = ${stale}`;
const left = await raw`select (select count(*) from room_marks)::int m, (select count(*) from day_staff)::int p, (select count(*) from room_assignments)::int a, (select count(*) from sheet_prints)::int pr, (select count(*) from staff where active)::int s`;
console.log("cleanup:", left[0]);
console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exitCode = 1;
