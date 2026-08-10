import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import type { Alert, AlertLevel } from "@/lib/types";
import { cn, formatRelativeTime } from "@/lib/utils";

const CONFIG: Record<AlertLevel, { icon: typeof Info; className: string }> = {
  info: { icon: Info, className: "text-info bg-info/10" },
  success: { icon: CheckCircle2, className: "text-success bg-success/10" },
  warning: { icon: AlertTriangle, className: "text-warning bg-warning/10" },
  critical: { icon: ShieldAlert, className: "text-destructive bg-destructive/10" },
};

export function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  return (
    <ul className="space-y-3" aria-label="Alerts">
      {alerts.map((alert) => {
        const { icon: Icon, className } = CONFIG[alert.level];
        return (
          <li key={alert.id} className="flex items-start gap-3">
            <span
              className={cn(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                className
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{alert.title}</p>
              <p className="text-muted-foreground text-xs">{alert.description}</p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {formatRelativeTime(alert.timestamp)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
