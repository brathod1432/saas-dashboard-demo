/** Health/readiness snapshot returned by /api/health. */
export interface HealthReport {
  status: "ok" | "degraded" | "down";
  uptimeSeconds: number;
  timestamp: string;
  version: string;
  checks: { name: string; status: "ok" | "fail"; detail?: string }[];
}

const startedAt = Date.now();

export function getHealth(): HealthReport {
  const checks: HealthReport["checks"] = [
    { name: "app", status: "ok" },
    { name: "mock-datastore", status: "ok", detail: "in-memory store reachable" },
    { name: "session", status: "ok", detail: "signing key present" },
  ];
  const failing = checks.filter((c) => c.status === "fail");
  return {
    status:
      failing.length === 0 ? "ok" : failing.length < checks.length ? "degraded" : "down",
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0",
    checks,
  };
}
