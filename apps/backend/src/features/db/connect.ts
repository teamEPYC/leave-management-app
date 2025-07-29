// connect.ts
import { WithEnv } from "../../utils/commonTypes";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export function connectDb({ env }: WithEnv<{}>) {
  const client = postgres(env.DB_CONNECTION_STRING, {
    prepare: false,
    idle_timeout: 20,
    max_lifetime: 60 * 10, // optional tuning
  });

  const db = drizzle(client, { casing: "snake_case" });
  return db;
}
