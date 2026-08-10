import { Check, Minus } from "lucide-react";
import type { Role } from "@/lib/types";
import {
  PERMISSIONS,
  ROLE_DEFINITIONS,
  hasPermission,
  type Permission,
} from "@/lib/rbac";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ROLES: Role[] = ["admin", "manager", "user", "viewer"];

/** Read-only role × permission matrix rendered from the single RBAC source. */
export function PermissionMatrix() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Permission</TableHead>
          {ROLES.map((role) => (
            <TableHead key={role} className="text-center">
              {ROLE_DEFINITIONS[role].label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {PERMISSIONS.map((permission: Permission) => (
          <TableRow key={permission}>
            <TableCell className="font-mono text-xs">{permission}</TableCell>
            {ROLES.map((role) => (
              <TableCell key={role} className="text-center">
                {hasPermission(role, permission) ? (
                  <Check className="text-success mx-auto h-4 w-4" aria-label="allowed" />
                ) : (
                  <Minus
                    className="text-muted-foreground/40 mx-auto h-4 w-4"
                    aria-label="denied"
                  />
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
