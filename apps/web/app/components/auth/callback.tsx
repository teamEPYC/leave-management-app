import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const apiKey = params.get("apiKey");
    const role = params.get("role");
    const firstLogin = params.get("firstLogin") === "true";

    if (apiKey) {
      localStorage.setItem("apiKey", apiKey);
    }

    if (firstLogin && role === "ADMIN") {
      navigate("/create-org");
    } else {
      navigate("/dashboard");
    }
  }, [navigate]);

  return <p>Signing you in...</p>;
}
