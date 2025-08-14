import { createCookieSessionStorage } from "react-router";

declare const process: { env?: Record<string, string | undefined> } | undefined;

// Resolve cookie secret 
let AUTH_COOKIE_SECRET = "dev-auth-cookie-secret-change-me";
try {
  const fromNode = process?.env?.AUTH_COOKIE_SECRET;
  if (fromNode) AUTH_COOKIE_SECRET = fromNode;
} catch {}
try {
  const fromVite = (import.meta as any)?.env?.VITE_AUTH_COOKIE_SECRET as string | undefined;
  if (fromVite) AUTH_COOKIE_SECRET = fromVite;
} catch {}

const isProd = AUTH_COOKIE_SECRET !== "dev-auth-cookie-secret-change-me" && (process?.env?.NODE_ENV ?? "development") === "production";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "lm_session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: isProd,
    secrets: [AUTH_COOKIE_SECRET],
  },
});

export const getSession = (cookieHeader: string | null) => sessionStorage.getSession(cookieHeader ?? undefined);
export const commitSession = (session: Awaited<ReturnType<typeof getSession>>) => sessionStorage.commitSession(session);
export const destroySession = (session: Awaited<ReturnType<typeof getSession>>) => sessionStorage.destroySession(session);

export type AppSessionKeys = "apiKey" | "currentOrgId";


