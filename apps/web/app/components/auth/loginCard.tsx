import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { CalendarCheckIcon, Globe } from "lucide-react";

// Build backend OAuth start URL so the browser follows the backend redirect to Google
const backendBaseUrl = (import.meta as any).env.VITE_BACKEND_BASE_URL?.replace(/\/$/, "") || "";
const googleAuthUrl = `${backendBaseUrl}/api/v1/auth/google/start`;

export default function LoginCard() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md border border-border shadow-md rounded-2xl bg-background">
        <CalendarCheckIcon size={80} className="mx-auto" />
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
            Welcome to Leave Manager
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            A simple way to manage your leaves, track holidays, and stay in sync
            with your team.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Benefits */}
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
            <li>Single-click login with Google</li>
            <li>Auto-join your organization using your email domain</li>
            <li>View leave balances and holiday calendar</li>
            <li>Apply and manage leaves with Slack + Email notifications</li>
          </ul>

          {/* Google Sign-In */}
          <Button
            variant="outline"
            size="lg"
            className="w-full flex items-center justify-center gap-3 font-medium"
            asChild
          >
            <a href={googleAuthUrl}>
              <Globe className="text-xl" />
              Continue with Google
            </a>
          </Button>

          {/* Support text */}
          <p className="text-xs text-muted-foreground text-center">
            Only users with a valid organization email can join. Your data stays
            secure.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
