import { Hono } from "hono";
import { googleAuthRoutes } from "./auth/google"; // Use original version

export const authEndpoint = new Hono();

authEndpoint.route("/google", googleAuthRoutes);