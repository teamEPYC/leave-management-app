import type { Env } from "../utils/env";

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface GoogleUserInfo {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

export async function exchangeCodeForUser({ code, env }: { code: string; env: Env }) {
  console.log("Starting OAuth exchange with:", {
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: env.GOOGLE_REDIRECT_URI,
    has_secret: !!env.GOOGLE_CLIENT_SECRET,
    secret_starts_with: env.GOOGLE_CLIENT_SECRET?.substring(0, 10)
  });

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

  const token = await tokenRes.json() as GoogleTokenResponse;
  console.log("Token response:", token);

  if (!token.access_token) {
    console.error("Token error:", token);
    return null;
  }

  const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
    },
  });

  const data = await userRes.json() as GoogleUserInfo;

  return {
    email: data.email,
    name: data.name,
    photoUrl: data.picture,
    googleId: data.sub,
  };
}
