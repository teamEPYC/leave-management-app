import { Outlet, redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getSession } from "~/lib/session.server";

export default function auth() {
  return <Outlet />;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const cookie = request.headers.get("Cookie");
  const session = await getSession(cookie);
  const apiKey = session.get("apiKey") as string | undefined;
  // If already authenticated, go to dashboard
  if (apiKey) {
    throw redirect("/dashboard");
  }
  return null;
}
