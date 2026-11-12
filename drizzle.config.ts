import { defineConfig } from "drizzle-kit";

// drizzle-kit runs outside Next, so load .env.local itself
process.loadEnvFile(".env.local");

// Migrations use the direct (unpooled) connection
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED! },
});
