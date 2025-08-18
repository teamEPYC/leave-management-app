import { useNavigate } from "react-router-dom";
import { Button } from "~/components/ui/button";
import { LogOut } from "lucide-react";
import { setSessionUser } from "~/lib/session";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Try to logout on backend to clear HttpOnly cookies if supported
      const base =
        (import.meta.env.VITE_BACKEND_BASE_URL as string | undefined) ||
        "http://127.0.0.1:8787";
      try {
        await fetch(`${base.replace(/\/$/, "")}/api/v1/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
      } catch {}
      // Fallback GET if backend expects GET
      try {
        await fetch(`${base.replace(/\/$/, "")}/api/v1/auth/logout`, {
          method: "GET",
          credentials: "include",
        });
      } catch {}

      // Clear client session
      setSessionUser(null);
    } finally {
      navigate("/", { replace: true });
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      size="sm"
      className="ml-auto"
    >
      <LogOut className="w-4 h-4" />
    </Button>
  );
}
