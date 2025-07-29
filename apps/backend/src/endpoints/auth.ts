import { Hono } from "hono";
import { googleAuthRoutes } from "./auth/google"; // <- this must match your google.ts export

export const authEndpoint = new Hono();


authEndpoint.route("/google", googleAuthRoutes);