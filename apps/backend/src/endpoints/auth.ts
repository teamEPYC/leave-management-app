import { Hono } from "hono";
import { googleAuthRoutes } from "./auth/google"; // Use original version
import { Variables } from "hono/types";

export const authEndpoint = new Hono<{ Bindings: Env; Variables: Variables }>();

authEndpoint.route("/google", googleAuthRoutes);