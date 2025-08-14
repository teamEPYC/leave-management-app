// utils/hono.ts
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { Env } from "./env";

// Define the variables type for Hono context
type Variables = {
  env: Env;
  db: ReturnType<typeof import("../features/db/connect").connectDb>;
};

export function getHono() {
  const app = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>({
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json({ ok: false, error: result.error }, 400);
      }
    },
  });

  // Add middleware
  app.use("*", cors());
  app.use("*", logger());

  return app;
}