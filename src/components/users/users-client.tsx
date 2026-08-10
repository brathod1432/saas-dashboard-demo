"use client";

import type { Role, User } from "@/lib/types";
import { useUsers, useUpdateUserRole } from "@/hooks/use-users";
import { ROLE_DEFINITIONS } from "@/lib/rbac";
import { useCurrentUser } from "@/components/auth/session-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ErrorState, TableSkeleton } from "@/components/shared/states";
import { getInitials, formatRelativeTime } from "@/lib/utils";

const ROLES: Role[] = ["admin", "manager", "user", "viewer"];

export function UsersClient() {
  const me = useCurrentUser();
  const { data, isLoading, isError, refetch } = useUsers();
  const updateRole = useUpdateUserRole();

  if (isLoading) return <TableSkeleton columns={4} />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Last active</TableHead>
            <TableHead className="w-44">Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(data ?? []).map((user: User) => {
            const isSelf = user.id === me.id;
            return (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback
                        style={{ backgroundColor: user.avatarColor, color: "#fff" }}
                        className="text-xs"
                      >
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {user.name}
                        {isSelf && (
                          <Badge variant="secondary" className="ml-2">
                            You
                          </Badge>
                        )}
                      </p>
                      <p className="text-muted-foreground text-xs">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.department}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatRelativeTime(user.lastActiveAt)}
                </TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onValueChange={(role) =>
                      updateRole.mutate({ id: user.id, role: role as Role })
                    }
                  >
                    <SelectTrigger aria-label={`Role for ${user.name}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {ROLE_DEFINITIONS[role].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
