import { defineConfig } from "drizzle-kit";

console.log("DATABASE_URL:", process.env.DATABASE_URL); // debug only

export default defineConfig({
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  casing: "snake_case",
  out: "migrations",
  schema: "./src/features/db/schema.ts",
});
