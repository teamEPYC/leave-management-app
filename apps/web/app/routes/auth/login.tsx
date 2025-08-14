import * as React from "react";
import LoginCard from "~/components/auth/loginCard";
import { Card } from "~/components/ui/card";

export default function Login() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen w-full">
      <LoginCard />
    </div>
  );
}
