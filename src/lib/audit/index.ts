import type { AuditAction, AuditLogEntry, AuditSeverity } from "@/lib/types";
import { db } from "@/lib/mock/data";
import { persist } from "@/lib/mock/persistence";
import { generateId } from "@/lib/utils";
import { logger } from "@/lib/observability/logger";

const DEFAULT_SEVERITY: Record<AuditAction, AuditSeverity> = {
  "auth.login": "info",
  "auth.logout": "info",
  "profile.update": "info",
  "project.update": "info",
  "project.create": "info",
  "invoice.create": "info",
  "settings.change": "warning",
  "customer.create": "info",
  "customer.update": "info",
  "customer.delete": "warning",
  "project.delete": "warning",
  "user.role_change": "warning",
  "access.denied": "critical",
};

export interface RecordAuditInput {
  action: AuditAction;
  actorId: string;
  actorName: string;
  target: string;
  ip?: string;
  severity?: AuditSeverity;
}

/**
 * Append an audit entry to the in-memory trail and mirror it to structured logs.
 * In production this would write to an append-only, tamper-evident store.
 */
export function recordAudit(input: RecordAuditInput): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: generateId("aud"),
    action: input.action,
    actorId: input.actorId,
    actorName: input.actorName,
    target: input.target,
    severity: input.severity ?? DEFAULT_SEVERITY[input.action],
    ip: input.ip ?? "0.0.0.0",
    timestamp: new Date().toISOString(),
  };
  db.auditLog.unshift(entry);
  persist();
  logger.info("audit", {
    action: entry.action,
    actor: entry.actorId,
    target: entry.target,
    severity: entry.severity,
  });
  return entry;
}

/** Read the audit trail (most recent first). */
export function listAudit(limit?: number): AuditLogEntry[] {
  return limit ? db.auditLog.slice(0, limit) : [...db.auditLog];
}
