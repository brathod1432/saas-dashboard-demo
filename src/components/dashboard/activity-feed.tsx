import { FileText, FolderKanban, Settings2, User, Users } from "lucide-react";
import type { Activity, ActivityType } from "@/lib/types";
import { findUserById } from "@/lib/auth/users";
import { formatRelativeTime, getInitials } from "@/lib/utils";

const ICONS: Record<ActivityType, typeof Users> = {
  customer: Users,
  project: FolderKanban,
  invoice: FileText,
  user: User,
  system: Settings2,
};

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <ul className="space-y-4" aria-label="Recent activity">
      {activities.map((activity) => {
        const actor = findUserById(activity.actorId);
        const Icon = ICONS[activity.type];
        return (
          <li key={activity.id} className="flex items-start gap-3">
            <span className="bg-muted text-muted-foreground mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate">
                <span className="font-medium">{actor?.name ?? "System"}</span>{" "}
                <span className="text-muted-foreground">{activity.message}</span>
              </p>
              <p className="text-muted-foreground text-xs">
                {formatRelativeTime(activity.timestamp)}
              </p>
            </div>
            {actor && (
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium text-white"
                style={{ backgroundColor: actor.avatarColor }}
                aria-hidden="true"
              >
                {getInitials(actor.name)}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
