import { Hono } from "hono";
import { RoleTable, UserTable } from "../../features/db/schema";
import { eq } from "drizzle-orm";
import { createApiKey } from "../../features/auth/auth";

type Variables = {
  env: Env;
  db: ReturnType<typeof import("../../features/db/connect").connectDb>;
};

export const googleAuthRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

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
  const env = c.env as any;
  const db = c.var.db;

  if (!code) {
    return c.json({ ok: false, error: "Missing authorization code" }, 400);
  }

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const token = await tokenRes.json() as any;
    if (!token.access_token) {
      console.error("❌ Token exchange failed", {
        code,
        env: {
          client_id: env.GOOGLE_CLIENT_ID,
          redirect_uri: env.GOOGLE_REDIRECT_URI,
          client_secret_starts_with: env.GOOGLE_CLIENT_SECRET?.slice(0, 6),
        },
        status: tokenRes.status,
        token,
      });

      return c.json({ ok: false, error: "Failed to get access token", details: token }, 401);
    }

    // 2. Get user profile
    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    });

    const userData = await userRes.json() as any;
    const { email, name, picture, sub: googleId } = userData;

    // 3. Check if user already exists
    const existingUser = await db
      .select()
      .from(UserTable)
      .where(eq(UserTable.email, email));

    let user;

    if (existingUser.length === 0) {
      // 4. Get EMPLOYEE role
      const employeeRole = await db
        .select({ id: RoleTable.id })
        .from(RoleTable)
        .where(eq(RoleTable.name, "EMPLOYEE"))
        .limit(1);

      if (employeeRole.length === 0) {
        return c.json({ ok: false, error: "EMPLOYEE role not found" }, 500);
      }

      // 5. Insert user
      const inserted = await db
        .insert(UserTable)
        .values({
          name,
          email,
          image: picture,
        })
        .returning();

      user = inserted[0];
    } else {
      user = existingUser[0];
    }

    // 6. Generate dummy API key (replace later with real token/session logic)
    // const apiKey = `epyc_${crypto.randomUUID().replace(/-/g, "")}`;
    const apiKey = await createApiKey({ env, userId: user.id });

    return c.json({
      ok: true,
      message: "OAuth successful",
      data: {
        apiKey,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
        token: {
          // access_token: token.access_token,
          expires_in: token.expires_in,
        },
      },
    });

  } catch (error: any) {
    console.error("OAuth error:", error);
    return c.json({ ok: false, error: "OAuth exchange failed", details: error.message }, 500);
  }
});


// Optional: debug route
googleAuthRoutes.get("/", (c) => c.text("Google auth routes are live"));

// Test endpoint to simulate OAuth callback for debugging
googleAuthRoutes.get("/test-callback", (c) => {
  const code = c.req.query("code");
  return c.json({
    message: "Test callback endpoint",
    code: code || "No code provided",
    env: {
      has_client_id: !!c.env.GOOGLE_CLIENT_ID,
      has_client_secret: !!c.env.GOOGLE_CLIENT_SECRET,
      has_redirect_uri: !!c.env.GOOGLE_REDIRECT_URI,
      client_id: c.env.GOOGLE_CLIENT_ID,
      redirect_uri: c.env.GOOGLE_REDIRECT_URI,
      secret_starts_with: c.env.GOOGLE_CLIENT_SECRET?.substring(0, 10)
    }
  });
});
