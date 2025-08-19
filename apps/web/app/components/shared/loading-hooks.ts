import { useNavigation } from "react-router-dom";
import { useState, useEffect } from "react";

/**
 * Custom hook for managing loading states
 * Provides loading state for route transitions and custom loading states
 */
export function useLoadingState() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [progress, setProgress] = useState(0);

  // Route loading state
  const isRouteLoading = navigation.state === "loading";
  const isSubmitting = navigation.state === "submitting";

  // Custom loading state
  const startLoading = (message?: string) => {
    setIsLoading(true);
    setLoadingMessage(message || "Loading...");
    setProgress(0);
  };

  const stopLoading = () => {
    setIsLoading(false);
    setLoadingMessage("");
    setProgress(0);
  };

  const updateProgress = (newProgress: number) => {
    setProgress(Math.min(100, Math.max(0, newProgress)));
  };

  const simulateProgress = (duration: number = 2000) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(90, (elapsed / duration) * 100);
      setProgress(progress);
      
      if (elapsed >= duration) {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          setIsLoading(false);
          setProgress(0);
        }, 200);
      }
    }, 50);

    return () => clearInterval(interval);
  };

  // Auto-stop loading when route changes
  useEffect(() => {
    if (isRouteLoading && isLoading) {
      stopLoading();
    }
  }, [isRouteLoading, isLoading]);

  return {
    // Route loading states
    isRouteLoading,
    isSubmitting,
    
    // Custom loading states
    isLoading,
    loadingMessage,
    progress,
    
    // Loading control functions
    startLoading,
    stopLoading,
    updateProgress,
    simulateProgress,
    
    // Combined loading state
    isAnyLoading: isRouteLoading || isSubmitting || isLoading,
  };
}

/**
 * Hook for form submission loading states
 */
export function useFormLoading() {
  const navigation = useNavigation();
  
  return {
    isSubmitting: navigation.state === "submitting",
    isSubmittingForm: navigation.state === "submitting" && navigation.formData !== null,
    formAction: navigation.formAction,
    formMethod: navigation.formMethod,
  };
}

/**
 * Hook for data loading states
 */
export function useDataLoading() {
  const navigation = useNavigation();
  
  return {
    isLoading: navigation.state === "loading",
    isLoadingData: navigation.state === "loading" && navigation.location !== null,
    location: navigation.location,
  };
}

/**
 * Hook for optimistic updates with loading states
 */
export function useOptimisticLoading<T>(
  initialData: T,
  updateFn: (data: T) => T
) {
  const [optimisticData, setOptimisticData] = useState<T>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateOptimistically = (updates: Partial<T>) => {
    setIsUpdating(true);
    const newData = { ...optimisticData, ...updates };
    setOptimisticData(newData);
    
    // Simulate API delay
    setTimeout(() => {
      setIsUpdating(false);
    }, 1000);
    
    return newData;
  };

  const resetToOriginal = () => {
    setOptimisticData(initialData);
    setIsUpdating(false);
  };

  return {
    optimisticData,
    isUpdating,
    updateOptimistically,
    resetToOriginal,
  };
}
