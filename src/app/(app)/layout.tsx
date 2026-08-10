import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth/server";
import { analyticsRepository } from "@/lib/api/repositories/analytics";
import { AppShell } from "@/components/layout/app-shell";

/**
 * Authenticated application shell. `requireUser()` is the server-side gate
 * (defense in depth alongside proxy.ts); it redirects to /login when unauthenticated.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const alerts = analyticsRepository.alerts();
  return (
    <AppShell user={user} alerts={alerts}>
      {children}
    </AppShell>
  );
}
