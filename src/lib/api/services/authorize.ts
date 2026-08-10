import type { Role } from "@/lib/types";
import { hasPermission, type Permission } from "@/lib/rbac";
import { recordAudit } from "@/lib/audit";
import { Errors } from "@/lib/api/errors";

/** The minimal actor context every service call carries. */
export interface Actor {
  id: string;
  name: string;
  role: Role;
  ip?: string;
}

/**
 * Central authorization gate for the service layer. Throws `403` and records an
 * `access.denied` audit event when the actor lacks the permission — defense in
 * depth alongside the proxy (route) and UI (`<Can>`) checks.
 */
export function authorize(
  actor: Actor,
  permission: Permission,
  target = permission
): void {
  if (!hasPermission(actor.role, permission)) {
    recordAudit({
      action: "access.denied",
      actorId: actor.id,
      actorName: actor.name,
      target,
      ip: actor.ip,
      severity: "critical",
    });
    throw Errors.forbidden(`Missing permission: ${permission}`);
  }
}
