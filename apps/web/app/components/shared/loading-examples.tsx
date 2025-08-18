import { useLoadingState, useFormLoading, useDataLoading } from "~/components/shared/loading-hooks";
import { LoadingBar, LoadingSpinner, LoadingDots, LoadingSkeleton } from "~/components/shared/route-loading";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

/**
 * Example component showing different loading states
 */
export function LoadingExamples() {
  const { isLoading, startLoading, stopLoading, simulateProgress } = useLoadingState();
  const { isSubmitting } = useFormLoading();
  const { isLoading: isDataLoading } = useDataLoading();

  const handleCustomLoading = () => {
    startLoading("Processing data...");
    simulateProgress(3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Loading States Examples</h1>
        <p className="text-muted-foreground">
          Different ways to show loading states in your app
        </p>
      </div>

      {/* Custom Loading States */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Loading States</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleCustomLoading}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? "Processing..." : "Start Custom Loading"}
            </Button>
            
            <Button 
              onClick={() => startLoading("Saving data...")}
              disabled={isLoading}
              size="sm"
            >
              Save Data
            </Button>
            
            <Button 
              onClick={stopLoading}
              disabled={!isLoading}
              size="sm"
              variant="outline"
            >
              Stop Loading
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Form Loading Example */}
      <Card>
        <CardHeader>
          <CardTitle>Form with Loading States</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded-md"
                disabled={isSubmitting}
                placeholder={isSubmitting ? "Please wait..." : "Enter text"}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input 
                type="email" 
                className="w-full p-2 border rounded-md"
                disabled={isSubmitting}
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <LoadingDots />
                  <span>Submitting...</span>
                </div>
              ) : (
                "Submit Form"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
