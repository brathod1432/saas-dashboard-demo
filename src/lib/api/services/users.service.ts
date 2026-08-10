import type { Role, User } from "@/lib/types";
import { usersRepository } from "@/lib/api/repositories/users";
import { recordAudit } from "@/lib/audit";
import { Errors } from "@/lib/api/errors";
import { ProfileUpdateSchema } from "@/lib/validation/schemas";
import { authorize, type Actor } from "./authorize";

const ROLES: Role[] = ["admin", "manager", "user", "viewer"];

export const usersService = {
  list(actor: Actor): User[] {
    authorize(actor, "users:manage");
    return usersRepository.list();
  },

  updateRole(actor: Actor, id: string, role: Role): User {
    authorize(actor, "users:manage");
    if (!ROLES.includes(role)) throw Errors.badRequest("Invalid role");

    const target = usersRepository.getById(id);
    if (!target) throw Errors.notFound("User not found");

    // Guardrails: prevent self-lockout and removing the last admin.
    if (target.id === actor.id && role !== "admin") {
      throw Errors.badRequest("You cannot change your own admin role");
    }
    if (
      target.role === "admin" &&
      role !== "admin" &&
      usersRepository.countByRole("admin") <= 1
    ) {
      throw Errors.badRequest("At least one admin is required");
    }

    const updated = usersRepository.updateRole(id, role)!;
    recordAudit({
      action: "user.role_change",
      actorId: actor.id,
      actorName: actor.name,
      target: `${id}:${role}`,
      ip: actor.ip,
    });
    return updated;
  },

  /** Self-service profile update for the authenticated user (no special permission). */
  updateProfile(actor: Actor, input: unknown): User {
    const parsed = ProfileUpdateSchema.safeParse(input);
    if (!parsed.success) throw Errors.badRequest(parsed.error.issues[0]?.message);
    const updated = usersRepository.update(actor.id, parsed.data);
    if (!updated) throw Errors.notFound("User not found");
    recordAudit({
      action: "profile.update",
      actorId: actor.id,
      actorName: actor.name,
      target: "account/profile",
      ip: actor.ip,
    });
    return updated;
  },
};
