import { OpenAPIHono } from "@hono/zod-openapi";

export function getHono() {
  return new OpenAPIHono<{ Bindings: Env }>();
}
