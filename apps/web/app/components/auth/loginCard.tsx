import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { CalendarCheckIcon, Globe } from "lucide-react";
import LiquidGlass from "~/components/shared/liquid-glass";

const googleAuthUrl = "/dashboard";

export default function LoginCard() {
  return (
    <LiquidGlass
      variant="card"
      intensity="medium"
      // animation="hover"
      blur={7}
      interactive={false}
      width="100%"
      className="w-full max-w-md mx-auto"
      backdropBlur={true}
      reflections={true}
      noiseTexture={false}
      tint="rgba(255, 255, 255, 0.2)"
      borderColor="rgba(255, 255, 255, 0.3)"
      shadowColor="rgba(0, 0, 0, 0.1)"
    >
      <div className="w-full p-8 space-y-6">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <CalendarCheckIcon size={80} className="drop-shadow-lg" />
        </div>

        {/* Header */}
        <div className="space-y-3 text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Welcome to Leave Manager
          </h1>
          <p className="text-white opacity-90 text-sm leading-relaxed px-2">
            A simple way to manage your leaves, track holidays, and stay in sync
            with your team.
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3 text-white opacity-90">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0 "></div>
            <span className="text-sm text-white opacity-90">
              Single-click login with Google
            </span>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
            <span className="text-sm text-white opacity-90">
              Auto-join your organization using your email domain
            </span>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
            <span className="text-sm text-white opacity-90">
              View leave balances and holiday calendar
            </span>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
            <span className="text-sm text-white opacity-90">
              Apply and manage leaves with Slack + Email notifications
            </span>
          </div>
        </div>

        {/* Google Sign-In Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            size="lg"
            className="w-full flex items-center justify-center gap-3 font-medium bg-black backdrop-blur-sm border-white/30 text-white opacity-90e hover:bg-white/30 transition-all duration-200"
            asChild
          >
            <Link to={googleAuthUrl}>
              <Globe className="w-5 h-5" />
              Continue with Google
            </Link>
          </Button>
        </div>

        {/* Support text */}
        <p className="text-xs text-white opacity-90 text-center leading-relaxed">
          Only users with a valid organization email can join. Your data stays
          secure.
        </p>
      </div>
    </LiquidGlass>
  );
}
