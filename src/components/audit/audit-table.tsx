import type { AuditLogEntry } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatRelativeTime } from "@/lib/utils";

const SEVERITY_TO_BADGE: Record<string, string> = {
  info: "low",
  warning: "high",
  critical: "critical",
};

export function AuditTable({ entries }: { entries: AuditLogEntry[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Severity</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Actor</TableHead>
          <TableHead>Target</TableHead>
          <TableHead>IP</TableHead>
          <TableHead>When</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>
              <StatusBadge value={SEVERITY_TO_BADGE[entry.severity] ?? "low"} />
            </TableCell>
            <TableCell className="font-mono text-xs">{entry.action}</TableCell>
            <TableCell>{entry.actorName}</TableCell>
            <TableCell className="font-mono text-xs">{entry.target}</TableCell>
            <TableCell className="text-muted-foreground font-mono text-xs">
              {entry.ip}
            </TableCell>
            <TableCell
              className="text-muted-foreground text-xs"
              title={formatDate(entry.timestamp)}
            >
              {formatRelativeTime(entry.timestamp)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
