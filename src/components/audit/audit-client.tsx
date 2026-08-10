"use client";

import type { AuditLogEntry } from "@/lib/types";
import { useAudit } from "@/hooks/use-audit";
import { DataTable, type Column } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ErrorState, TableSkeleton } from "@/components/shared/states";
import { formatDate, formatRelativeTime } from "@/lib/utils";

const SEVERITY_TO_BADGE: Record<string, string> = {
  info: "low",
  warning: "high",
  critical: "critical",
};

const STATUS_OPTIONS = [
  { label: "Info", value: "info" },
  { label: "Warning", value: "warning" },
  { label: "Critical", value: "critical" },
];

const columns: Column<AuditLogEntry>[] = [
  {
    key: "severity",
    header: "Severity",
    sortable: true,
    sortValue: (e) => e.severity,
    exportValue: (e) => e.severity,
    cell: (e) => <StatusBadge value={SEVERITY_TO_BADGE[e.severity] ?? "low"} />,
  },
  {
    key: "action",
    header: "Action",
    sortable: true,
    sortValue: (e) => e.action,
    exportValue: (e) => e.action,
    cell: (e) => <span className="font-mono text-xs">{e.action}</span>,
  },
  {
    key: "actor",
    header: "Actor",
    sortable: true,
    sortValue: (e) => e.actorName,
    exportValue: (e) => e.actorName,
    cell: (e) => e.actorName,
  },
  {
    key: "target",
    header: "Target",
    exportValue: (e) => e.target,
    cell: (e) => <span className="font-mono text-xs">{e.target}</span>,
  },
  {
    key: "ip",
    header: "IP",
    exportValue: (e) => e.ip,
    cell: (e) => <span className="text-muted-foreground font-mono text-xs">{e.ip}</span>,
  },
  {
    key: "timestamp",
    header: "When",
    sortable: true,
    sortValue: (e) => e.timestamp,
    exportValue: (e) => e.timestamp,
    cell: (e) => (
      <span className="text-muted-foreground text-xs" title={formatDate(e.timestamp)}>
        {formatRelativeTime(e.timestamp)}
      </span>
    ),
  },
];

export function AuditClient() {
  const { data, isLoading, isError, refetch } = useAudit();

  if (isLoading) return <TableSkeleton columns={6} />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <DataTable
      data={data ?? []}
      columns={columns}
      getRowId={(e) => e.id}
      searchableText={(e) => `${e.action} ${e.actorName} ${e.target} ${e.ip}`}
      searchPlaceholder="Search audit events…"
      statusOptions={STATUS_OPTIONS}
      statusOf={(e) => e.severity}
      exportFileName="audit-log"
      pageSize={20}
    />
  );
}
