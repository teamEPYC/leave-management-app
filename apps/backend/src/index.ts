import { Scalar } from "@scalar/hono-api-reference";
import { getHono } from "./utils/hono";
import { authEndpoint } from "./endpoints/auth";
import { connectDb } from "./features/db/connect";
import { organizationEndpoint } from "./endpoints/organization";

const app = getHono();

app.doc("/doc", {
  info: {
    title: "Leave Management API",
    description: "API for the EPYC Leave Management app",
    version: "0.0.0",
  },
  openapi: "3.0.0",
});

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

// ✅ Register auth endpoint correctly
app.route("/api/v1/auth", authEndpoint);
app.route("/api/v1/organization", organizationEndpoint);

app.get("/api", Scalar({ url: "/doc", theme: "elysiajs", layout: "classic" }));


// app.get("/debug-db", async (c) => {
//   try {
//     const db = connectDb({ env: c.env as any });
//     console.log("db", db);
//     return c.json({ ok: true, message: "Database connection working", db });

//   } catch (error: any) {
//     console.error("Database test error:", error);
//     return c.json({ ok: false, error: "Database test failed", details: error.message }, 500);
//   }
// });


export default app;

