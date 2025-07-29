// apps/backend/src/lib/google.ts
export async function exchangeCodeForUser({ code, env }) {
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

  const token = await tokenRes.json();
  if (!token.access_token) return null;

  const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
    },
  });

  const data = await userRes.json();

  return {
    email: data.email,
    name: data.name,
    photoUrl: data.picture,
    googleId: data.sub,
  };
}
