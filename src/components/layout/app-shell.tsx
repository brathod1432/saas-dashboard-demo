"use client";

import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionProvider } from "@/components/auth/session-context";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import type { Alert, User } from "@/lib/types";
import { DemoBanner } from "@/components/shared/demo-banner";

export function AppShell({
  user,
  alerts,
  children,
}: {
  user: User;
  alerts: Alert[];
  children: ReactNode;
}) {
  return (
    <SessionProvider user={user}>
      <TooltipProvider delayDuration={200}>
        <div className="flex min-h-svh">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar alerts={alerts} />
            <DemoBanner />
            <main
              id="main-content"
              tabIndex={-1}
              className="flex-1 px-4 py-6 focus:outline-none lg:px-8"
            >
              {children}
            </main>
          </div>
        </div>
      </TooltipProvider>
    </SessionProvider>
  );
}
