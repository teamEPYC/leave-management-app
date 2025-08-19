import { useNavigation } from "react-router-dom";
import { Loader2, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "~/components/ui/skeleton";

interface RouteLoadingProps {
  variant?: "bar" | "spinner" | "dots" | "skeleton";
  showOnHover?: boolean;
}

export function RouteLoading({ variant = "bar", showOnHover = false }: RouteLoadingProps) {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (navigation.state === "loading") {
      setIsLoading(true);
      setProgress(0);
      
      // Animate progress bar
      if (variant === "bar") {
        const interval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 90) {
              clearInterval(interval);
              return 90;
            }
            return prev + 10;
          });
        }, 50);

        return () => clearInterval(interval);
      }
    } else {
      if (variant === "bar") {
        setProgress(100);
        const timer = setTimeout(() => {
          setIsLoading(false);
          setProgress(0);
        }, 200);
        
        return () => clearTimeout(timer);
      } else {
        setIsLoading(false);
      }
    }
  }, [navigation.state, variant]);

  if (!isLoading) return null;

  switch (variant) {
    case "bar":
      return (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div 
            className="h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/60 transition-all duration-200 ease-out shadow-lg"
            style={{ width: `${progress}%` }}
          />
        </div>
      );

    case "spinner":
      return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-lg shadow-lg border">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      );

    case "dots":
      return (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-center gap-2 p-3 bg-card rounded-lg shadow-lg border">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-xs text-muted-foreground">Loading</span>
          </div>
        </div>
      );

    case "skeleton":
      return (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="h-1 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 animate-pulse" />
        </div>
      );

    default:
      return null;
  }
}

// Specialized loading components for different use cases
export function LoadingBar() {
  return <RouteLoading variant="bar" />;
}

export function LoadingSpinner() {
  return <RouteLoading variant="spinner" />;
}

export function LoadingDots() {
  return <RouteLoading variant="dots" />;
}

export function LoadingSkeleton() {
  return <RouteLoading variant="skeleton" />;
}

// Loading state for specific routes
export function RouteLoadingState() {
  const navigation = useNavigation();
  
  if (navigation.state !== "loading") return null;

  return (
    <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 p-8 bg-card rounded-xl shadow-2xl border">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-lg">Loading Route</h3>
          <p className="text-sm text-muted-foreground">
            {navigation.location?.pathname}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ArrowRight className="h-3 w-3" />
          <span>Navigating...</span>
        </div>
      </div>
    </div>
  );
}
