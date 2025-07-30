// connect.ts
import { WithEnv } from "../../utils/commonTypes";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export function connectDb({ env }: WithEnv<{}>) {
  try {
    console.log("Connecting to database with URL:", env.DATABASE_URL?.substring(0, 50) + "...");
    
    const client = postgres(env.DATABASE_URL, {
      prepare: false,
      idle_timeout: 20,
      max_lifetime: 60 * 10, // optional tuning
    });

    const db = drizzle(client, { casing: "snake_case" });
    console.log("Database connection successful");
    return db;
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
}
