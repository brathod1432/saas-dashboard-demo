"use client";

import { Bell, Check, X } from "lucide-react";
import type { Alert } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotificationsStore } from "@/stores/notifications-store";
import { cn, formatRelativeTime } from "@/lib/utils";

/** Interactive notifications: unread badge, mark-as-read, and dismiss. */
export function NotificationsMenu({ alerts }: { alerts: Alert[] }) {
  const readIds = useNotificationsStore((s) => s.readIds);
  const dismissedIds = useNotificationsStore((s) => s.dismissedIds);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const dismiss = useNotificationsStore((s) => s.dismiss);

  const visible = alerts.filter((a) => !dismissedIds.includes(a.id));
  const unread = visible.filter((a) => !readIds.includes(a.id));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications${unread.length ? `, ${unread.length} unread` : ""}`}
        >
          <Bell className="h-4 w-4" />
          {unread.length > 0 && (
            <span className="bg-destructive absolute top-1.5 right-1.5 h-2 w-2 rounded-full" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            Notifications
            <Badge variant="secondary">{unread.length}</Badge>
          </span>
          {unread.length > 0 && (
            <button
              onClick={() => markAllRead(visible.map((a) => a.id))}
              className="text-primary inline-flex items-center gap-1 text-xs font-normal hover:underline"
            >
              <Check className="h-3 w-3" /> Mark all read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {visible.length === 0 ? (
          <p className="text-muted-foreground px-3 py-6 text-center text-sm">
            You&apos;re all caught up.
          </p>
        ) : (
          <ul className="max-h-96 overflow-y-auto py-1">
            {visible.map((alert) => {
              const isRead = readIds.includes(alert.id);
              return (
                <li
                  key={alert.id}
                  className={cn(
                    "hover:bg-accent/60 group flex items-start gap-2 px-3 py-2",
                    isRead && "opacity-60"
                  )}
                >
                  <button
                    onClick={() => markRead(alert.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      {!isRead && (
                        <span className="bg-primary h-1.5 w-1.5 shrink-0 rounded-full" />
                      )}
                      {alert.title}
                    </span>
                    <span className="text-muted-foreground block text-xs">
                      {alert.description}
                    </span>
                    <span className="text-muted-foreground block text-[10px]">
                      {formatRelativeTime(alert.timestamp)}
                    </span>
                  </button>
                  <button
                    onClick={() => dismiss(alert.id)}
                    aria-label={`Dismiss ${alert.title}`}
                    className="text-muted-foreground hover:text-foreground mt-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
