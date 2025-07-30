// connect.ts
import { WithEnv } from "../../utils/commonTypes";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export function connectDb({ env }: WithEnv<{}>) {
  try {
    console.log("Connecting to database with URL:", env.DATABASE_URL?.substring(0, 50) + "...");  
    const client = drizzle(env.DB.connectionString, {casing: "snake_case"})
    console.log("Database connection successful");
    return client;
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
}
