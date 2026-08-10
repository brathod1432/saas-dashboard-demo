"use client";

/**
 * Global error boundary — catches errors in the root layout itself.
 * Must render its own <html>/<body>. Kept dependency-free on purpose.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "system-ui, sans-serif",
          padding: "1.5rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Something went wrong</h1>
        <p style={{ color: "#6b7280", maxWidth: "28rem" }}>
          A critical error occurred. Please try reloading.
          {error.digest ? ` (ref: ${error.digest})` : ""}
        </p>
        <button
          onClick={reset}
          style={{
            borderRadius: "0.5rem",
            background: "#4f46e5",
            color: "#fff",
            padding: "0.5rem 1rem",
            border: "none",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
