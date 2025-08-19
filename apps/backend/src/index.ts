import { Scalar } from "@scalar/hono-api-reference";
import { getHono } from "./utils/hono";
import { authEndpoint } from "./endpoints/auth";
import { connectDb } from "./features/db/connect";
import { organizationEndpoint } from "./endpoints/organization";
import { groupEndpoint } from "./endpoints/group";
import { leaveTypeEndpoint } from "./endpoints/leave-type";
import { userEndpoint } from "./endpoints/users";

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
app.route("/api/v1/group", groupEndpoint);
app.route("/api/v1/leave-type", leaveTypeEndpoint);
app.route("/api/v1/users", userEndpoint);

app.get("/api", Scalar({ url: "/doc", theme: "elysiajs", layout: "classic" }));

export default app;
