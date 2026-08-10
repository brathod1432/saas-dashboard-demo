import type { AppSettings } from "@/lib/types";
import { settingsRepository } from "@/lib/api/repositories/settings";
import { recordAudit } from "@/lib/audit";
import { Errors } from "@/lib/api/errors";
import { SettingsSchema } from "@/lib/validation/schemas";
import { authorize, type Actor } from "./authorize";

export const settingsService = {
  get(actor: Actor): AppSettings {
    authorize(actor, "settings:view");
    return settingsRepository.get();
  },

  update(actor: Actor, input: unknown): AppSettings {
    authorize(actor, "settings:edit");
    const parsed = SettingsSchema.safeParse(input);
    if (!parsed.success) throw Errors.badRequest(parsed.error.issues[0]?.message);
    const updated = settingsRepository.update(parsed.data);
    recordAudit({
      action: "settings.change",
      actorId: actor.id,
      actorName: actor.name,
      target: "settings",
      ip: actor.ip,
    });
    return updated;
  },
};
