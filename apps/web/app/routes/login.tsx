import * as React from "react";
import LoginCard from "~/components/auth/loginCard";

export default function Login() {
  return (
    <div
      className="flex flex-col justify-center items-center min-h-screen w-full relative"
      style={{
        backgroundImage: "url('/LoginBG.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Optional: Add a subtle overlay to improve readability */}
      <div className="absolute inset-0 bg-black/10 dark:bg-black/30"></div>

      {/* Login card with relative positioning to appear above overlay */}
      <div className="relative z-10">
        <LoginCard />
      </div>
    </div>
  );
}
