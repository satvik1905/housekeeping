import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// App queries use the pooled connection. Importing this from client code
// fails the build (server-only), so the URL never reaches the browser.
export const db = drizzle({ client: neon(process.env.DATABASE_URL!), schema });
