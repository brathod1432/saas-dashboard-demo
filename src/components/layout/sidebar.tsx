"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { hasPermission } from "@/lib/rbac";
import { useCurrentUser } from "@/components/auth/session-context";
import { NAV_SECTIONS } from "./nav-config";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";

export function Sidebar() {
  const pathname = usePathname();
  const user = useCurrentUser();
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-40 flex w-64 flex-col transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Primary"
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="bg-sidebar-accent flex h-8 w-8 items-center justify-center rounded-lg">
              <Boxes className="h-5 w-5 text-white" />
            </span>
            <span>Nexus Ops</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-muted lg:hidden"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {NAV_SECTIONS.map((section) => {
            const items = section.items.filter((item) =>
              hasPermission(user.role, item.permission)
            );
            if (items.length === 0) return null;
            return (
              <div key={section.title}>
                <p className="text-sidebar-foreground/50 px-3 pb-2 text-xs font-semibold tracking-wider uppercase">
                  {section.title}
                </p>
                <ul className="space-y-1">
                  {items.map((item) => {
                    const active =
                      pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            active
                              ? "bg-sidebar-accent text-white"
                              : "text-sidebar-foreground/80 hover:bg-sidebar-muted hover:text-white"
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="border-sidebar-muted border-t p-4 text-xs">
          <p className="text-sidebar-foreground/60">Signed in as</p>
          <p className="font-medium">{user.name}</p>
          <p className="text-sidebar-foreground/60 capitalize">{user.role}</p>
        </div>
      </aside>
    </>
  );
}
