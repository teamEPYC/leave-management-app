export type SessionUser = {
  id?: string | null
  name?: string | null
  email?: string | null
  avatarUrl?: string | null
};

const SESSION_USER_KEY = "lm_user";

export function getSessionUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function setSessionUser(user: SessionUser | null) {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      window.localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(SESSION_USER_KEY);
    }
  } catch {
    // ignore
  }
}


