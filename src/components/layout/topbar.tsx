"use client";

import { useRouter } from "next/navigation";
import { Bell, LogOut, Menu, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCurrentUser } from "@/components/auth/session-context";
import { useUiStore } from "@/stores/ui-store";
import { getInitials } from "@/lib/utils";
import { httpClient } from "@/lib/api/clients/http";
import type { Alert } from "@/lib/types";

export function Topbar({ alerts }: { alerts: Alert[] }) {
  const user = useCurrentUser();
  const router = useRouter();
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  async function handleLogout() {
    await httpClient.post("/auth/logout", {});
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-20 flex h-16 items-center gap-3 border-b px-4 backdrop-blur lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Open navigation"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="relative hidden max-w-sm flex-1 md:block">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          type="search"
          placeholder="Search customers, projects…"
          aria-label="Global search"
          className="pl-9"
        />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {alerts.length > 0 && (
                <span className="bg-destructive absolute top-1.5 right-1.5 h-2 w-2 rounded-full" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications
              <Badge variant="secondary">{alerts.length}</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {alerts.slice(0, 4).map((alert) => (
              <DropdownMenuItem key={alert.id} className="flex-col items-start gap-0.5">
                <span className="text-sm font-medium">{alert.title}</span>
                <span className="text-muted-foreground text-xs">{alert.description}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2" aria-label="Account menu">
              <Avatar>
                <AvatarFallback
                  style={{ backgroundColor: user.avatarColor, color: "#fff" }}
                >
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">{user.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user.name}</span>
                <span className="text-muted-foreground text-xs font-normal">
                  {user.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/account")}>
              Account
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
