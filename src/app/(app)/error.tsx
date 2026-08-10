"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Route-level error boundary for the authenticated app. */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // A real app forwards this to an error monitor (Sentry, etc.).
    console.error("App route error:", error);
  }, [error]);

  return (
    <div
      role="alert"
      className="border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center rounded-lg border px-6 py-16 text-center"
    >
      <div className="bg-destructive/10 text-destructive mb-4 flex h-12 w-12 items-center justify-center rounded-full">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground mt-1 max-w-md text-sm">
        An unexpected error occurred while loading this page. You can try again.
      </p>
      <Button variant="outline" className="mt-4" onClick={reset}>
        <RefreshCw className="h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}
