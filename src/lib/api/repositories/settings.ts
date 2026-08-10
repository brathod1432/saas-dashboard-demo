import type { AppSettings } from "@/lib/types";
import { db } from "@/lib/mock/data";
import { persist } from "@/lib/mock/persistence";

export const settingsRepository = {
  get(): AppSettings {
    return { ...db.settings };
  },

  update(patch: Partial<AppSettings>): AppSettings {
    Object.assign(db.settings, patch);
    persist();
    return { ...db.settings };
  },
};
