import * as React from "react";
import LoginCard from "~/components/auth/loginCard";
import { redirect, type LoaderFunctionArgs } from "react-router";
import { getSession } from "~/lib/session.server";

export default function Login() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen w-full">
      <LoginCard />
    </div>
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const cookie = request.headers.get("Cookie");
  const session = await getSession(cookie);
  const apiKey = session.get("apiKey") as string | undefined;
  if (apiKey) {
    throw redirect("/dashboard");
  }
  return null;
}
