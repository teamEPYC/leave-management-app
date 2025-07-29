import { createRoute } from "@hono/zod-openapi";
import { exchangeCodeForUser } from "../../lib/google";
import { createUser, getUserByEmail } from "../../lib/user";
import { createApiKey } from "../../lib/auth";
import { Hono } from "hono";

// Export a Hono router
export const googleAuthRoutes = new Hono();

// 1. Start Google OAuth flow
googleAuthRoutes.get("/start", (c) => {
  const { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } = c.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
    return c.json({ ok: false, error: "Missing Google client env vars" }, 500);
  }

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", GOOGLE_REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("access_type", "offline");

  return c.redirect(url.toString());
});

// 2. Google Callback → Handle code exchange, create user, return API key
googleAuthRoutes.get("/callback", async (c) => {
  const code = c.req.query("code");
  const { env, db } = c.var;

  if (!code) {
    return c.json({ ok: false, error: "Missing authorization code" }, 400);
  }

  const googleUser = await exchangeCodeForUser({ code, env });

  if (!googleUser) {
    return c.json({ ok: false, error: "Invalid Google user response" }, 401);
  }

  const { email, name, googleId, photoUrl } = googleUser;

  let user = await getUserByEmail({ email, db });

  if (!user) {
    const result = await createUser({
      db,
      email,
      name,
      company: "Google",
      plainTextPassword: crypto.randomUUID(), // temporary password
      photoUrl,
      googleId,
    });

    if (!result.ok) {
      return c.json(result, 400);
    }

    user = result.user;
  }

  const apiKey = await createApiKey({ env, userId: user.id });

  return c.json({ ok: true, data: { apiKey, user } });
});
