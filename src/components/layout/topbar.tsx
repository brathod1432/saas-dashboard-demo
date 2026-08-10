"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationsMenu } from "./notifications-menu";
import { useCurrentUser } from "@/components/auth/session-context";
import { useUiStore } from "@/stores/ui-store";
import { getInitials } from "@/lib/utils";
import { httpClient } from "@/lib/api/clients/http";
import type { Alert } from "@/lib/types";

export function Topbar({ alerts }: { alerts: Alert[] }) {
  const user = useCurrentUser();
  const router = useRouter();
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const setCommandOpen = useUiStore((s) => s.setCommandOpen);

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

      <button
        type="button"
        onClick={() => setCommandOpen(true)}
        aria-label="Open search (Command or Control + K)"
        className="border-input bg-background text-muted-foreground hover:bg-accent hidden h-9 max-w-sm flex-1 items-center gap-2 rounded-md border px-3 text-sm transition-colors md:flex"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">Search customers, projects…</span>
        <kbd className="bg-muted rounded px-1.5 py-0.5 text-[10px] font-medium">⌘K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />

        <NotificationsMenu alerts={alerts} />

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
