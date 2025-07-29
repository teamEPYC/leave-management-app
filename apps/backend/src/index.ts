import { Scalar } from "@scalar/hono-api-reference";
import { getHono } from "./utils/hono";
import { authEndpoint } from "./endpoints/auth";

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

app.get("/ping", (c) => c.text("pong"));

export default app;
