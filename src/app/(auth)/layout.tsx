import type { ReactNode } from "react";
import Link from "next/link";
import { Boxes, ShieldCheck, Accessibility, Activity } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Brand / value panel */}
      <div className="bg-sidebar text-sidebar-foreground hidden flex-col justify-between p-10 lg:flex">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="bg-sidebar-accent flex h-9 w-9 items-center justify-center rounded-lg">
            <Boxes className="h-5 w-5 text-white" />
          </span>
          Nexus Ops
        </Link>

        <div className="space-y-6">
          <h2 className="text-3xl leading-tight font-semibold">
            The secure, accessible foundation for modern business software.
          </h2>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <ShieldCheck className="text-sidebar-accent mt-0.5 h-5 w-5 shrink-0" />
              <span>
                Security-first: RBAC, protected routing, audit trail, security headers.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Accessibility className="text-sidebar-accent mt-0.5 h-5 w-5 shrink-0" />
              <span>
                Accessible by design: WCAG AA, keyboard nav, screen-reader support.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Activity className="text-sidebar-accent mt-0.5 h-5 w-5 shrink-0" />
              <span>
                Observability built in: metrics, structured logs, tracing, health checks.
              </span>
            </li>
          </ul>
        </div>

        <p className="text-sidebar-foreground/50 text-xs">
          Demo environment — mock authentication &amp; seeded data.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
