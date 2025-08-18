// app/routes/auth/authCallback.tsx
import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { listOrganizations } from "~/lib/api/organization/organizations";
import { setSessionUser } from "~/lib/session";
import { commitSession, getSession } from "~/lib/session.server";

// Define the expected shape of the backend's successful response payload
interface GoogleAuthPayload {
  ok: boolean;
  data?: {
    apiKey?: string;
    user?: {
      id?: string;
      name?: string;
      email?: string;
      image?: string;
    };
    token?: { expires_in?: number };
  };
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    console.error("Missing code param in Google OAuth callback.");
    throw redirect("/?error=auth_failed");
  }

  try {
    // Safely get the backend base URL and remove any trailing slash
    const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL?.replace(
      /\/$/,
      ""
    );

    if (!backendBaseUrl) {
      console.error("VITE_BACKEND_BASE_URL is not defined in the environment.");
      throw redirect("/?error=config_error");
    }

    // The `fetch` call now correctly constructs the URL without a double slash
    const res = await fetch(
      `${backendBaseUrl}/api/v1/auth/google/callback?code=${encodeURIComponent(
        code
      )}`,
      { credentials: "include" }
    );

    const contentType = res.headers.get("content-type") || "";
    let payload: GoogleAuthPayload | { ok: false; error?: unknown; details?: unknown } | null = null;
    if (contentType.includes("application/json")) {
      try {
        payload = (await res.json()) as any;
      } catch {}
    }

    if (!res.ok) {
      const message = payload && "error" in payload ? JSON.stringify(payload) : `status=${res.status}`;
      throw redirect(`/?error=oauth_backend_error&details=${encodeURIComponent(message)}`);
    }

    if (!payload || typeof payload !== "object" || !(payload as any).ok) {
      throw redirect("/?error=invalid_response");
    }

    payload = payload as GoogleAuthPayload;

    if (!payload.ok || !payload.data?.apiKey || !payload.data?.user?.email) {
      console.error("Missing apiKey or email in backend payload.", { payload });
      throw redirect("/?error=missing_user_data");
    }

    const { apiKey } = payload.data;
    const id = payload.data.user?.id ?? null;
    const email = payload.data.user?.email ?? null;
    const name = payload.data.user?.name ?? null;
    const avatarUrl = payload.data.user?.image ?? null;

    setSessionUser({ id, name, email, avatarUrl });

    // Persist apiKey server-side in cookie session
    const cookie = request.headers.get("Cookie");
    const session = await getSession(cookie);
    session.set("apiKey", apiKey);

    // We now have the apiKey. The `listOrganizations` function in orgClient.ts does
    // NOT require an apiKey, so we only pass the email.
    const orgs = await listOrganizations({ email: email! });

    if (orgs.length > 0) {
      // Set the first org as current and go to dashboard with user/org payload for client boot
      const current = orgs[0];
      session.set("currentOrgId", current.id);
      const headers = new Headers({ "Set-Cookie": await commitSession(session) });
      const userString = encodeURIComponent(
        JSON.stringify({ id, name, email, avatarUrl })
      );
      return redirect(`/dashboard?user=${userString}`, { headers });
    }

    // No org found, redirect to onboarding with apiKey and user data
    const userString = encodeURIComponent(
      JSON.stringify({ name, email, avatarUrl })
    );
    const headers = new Headers({ "Set-Cookie": await commitSession(session) });
    return redirect(`/onboarding?user=${userString}`, { headers });
  } catch (err) {
    // If an upstream redirect was thrown, rethrow it so the framework handles it.
    if (err instanceof Response) {
      throw err;
    }
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Error completing Google OAuth:", msg);
    throw redirect(`/?error=auth_exchange_failed&details=${encodeURIComponent(msg)}`);
  }
}

export default function AuthCallback() {
  return <div>Completing login...</div>;
}
