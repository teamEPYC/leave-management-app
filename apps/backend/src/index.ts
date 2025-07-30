import { Scalar } from "@scalar/hono-api-reference";
import { getHono } from "./utils/hono";
import { authEndpoint } from "./endpoints/auth";
import { connectDb } from "./features/db/connect";
import { Roles } from "./features/db/schema";

const app = getHono();

app.doc("/doc", {
  info: {
    title: "Leave Management API",
    description: "API for the EPYC Leave Management app",
    version: "0.0.0",
  },
  openapi: "3.0.0",
});

// ✅ Register auth endpoint correctly
app.route("/api/v1/auth", authEndpoint);

app.get("/api", Scalar({ url: "/doc", theme: "elysiajs", layout: "classic" }));

app.use("*", async (c, next) => {
  try {
    c.set("env", c.env); // exposes c.env as c.var.env
    const db = connectDb({ env: c.env as any }); // exposes db as c.var.db
    c.set("db", db);
    await next();
  } catch (error) {
    console.error("Middleware error:", error);
    return c.json({ ok: false, error: "Database connection failed" }, 500);
  }
});

app.get("/debug-env", (c) => {
  return c.json({
    GOOGLE_CLIENT_ID: c.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: c.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: c.env.GOOGLE_REDIRECT_URI,
  });
});

app.get("/debug-db", async (c) => {
  try {
    const db = c.var.db;
    if (!db) {
      return c.json({ ok: false, error: "Database not available" }, 500);
    }
    
    // Test database connection
    const result = await db.select().from(Roles).limit(1);
    return c.json({ ok: true, message: "Database connection working", result });
  } catch (error: any) {
    console.error("Database test error:", error);
    return c.json({ ok: false, error: "Database test failed", details: error.message }, 500);
  }
});


export default app;

