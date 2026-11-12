// Seeds staff from src/data/staff.ts, in the same order (ids follow it).
// Run once with `npm run db:seed`; does nothing if staff already has rows.
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { STAFF } from "../src/data/staff";
import { staff } from "../src/db/schema";

process.loadEnvFile(".env.local");

// A one-off admin task like migrations, so it uses the direct connection
const db = drizzle({ client: neon(process.env.DATABASE_URL_UNPOOLED!) });

const existing = await db.select({ id: staff.id }).from(staff).limit(1);
if (existing.length > 0) {
  console.log("staff already seeded; nothing to do");
} else {
  // One row at a time so ids follow STAFF's order
  for (const { name, role } of STAFF) {
    await db.insert(staff).values({ name, role });
  }
  console.log(`seeded ${STAFF.length} staff`);
}
