import type { AuditLogEntry } from "@/lib/types";
import { listAudit } from "@/lib/audit";
import { authorize, type Actor } from "./authorize";

export const auditService = {
  list(actor: Actor): AuditLogEntry[] {
    authorize(actor, "audit:view");
    return listAudit();
  },
};
