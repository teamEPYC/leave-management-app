// app/routes/auth/authCallback.tsx
import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { listOrganizations } from "~/lib/api/organization/organizations";
import { setSessionUser } from "~/lib/session";

// Define the expected shape of the backend's successful response payload
interface GoogleAuthPayload {
  data?: {
    apiKey?: string;
    email?: string;
    name?: string;
    avatarUrl?: string;
  };
  ok: boolean;
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
    if (!res.ok || !contentType.includes("application/json")) {
      console.error("Backend did not return a valid JSON payload.", {
        status: res.status,
      });
      // Redirect to the login page on any fetch/API error
      throw redirect("/?error=invalid_response");
    }

    const payload: GoogleAuthPayload = await res.json();

    if (!payload.ok || !payload.data?.apiKey || !payload.data?.email) {
      console.error("Missing apiKey or email in backend payload.", { payload });
      throw redirect("/?error=missing_user_data");
    }

    const { apiKey, email, name, avatarUrl } = payload.data;

    setSessionUser({
      name: name ?? null,
      email: email ?? null,
      avatarUrl: avatarUrl ?? null,
    });

    // We now have the apiKey. The `listOrganizations` function in orgClient.ts does
    // NOT require an apiKey, so we only pass the email.
    const orgs = await listOrganizations({ email });

    if (orgs.length > 0) {
      // Go straight to the dashboard if the user already belongs to an org
      return redirect("/dashboard");
    }

    // No org found, redirect to onboarding with apiKey and user data
    const userString = encodeURIComponent(
      JSON.stringify({ name, email, avatarUrl })
    );
    return redirect(`/onboarding?apiKey=${apiKey}&user=${userString}`);
  } catch (err) {
    console.error("Error completing Google OAuth:", err);
    throw redirect("/?error=auth_exchange_failed");
  }
}

export default function AuthCallback() {
  return <div>Completing login...</div>;
}
