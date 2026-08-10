import { Badge, type BadgeProps } from "@/components/ui/badge";

type Variant = BadgeProps["variant"];

const STATUS_VARIANT: Record<string, Variant> = {
  // customers
  active: "success",
  prospect: "info",
  on_hold: "warning",
  churned: "destructive",
  // projects
  planning: "info",
  completed: "success",
  cancelled: "destructive",
  // invoices
  paid: "success",
  sent: "info",
  overdue: "destructive",
  draft: "secondary",
  void: "secondary",
  // priorities
  low: "secondary",
  medium: "info",
  high: "warning",
  critical: "destructive",
};

const LABELS: Record<string, string> = {
  on_hold: "On hold",
};

function humanize(value: string): string {
  return LABELS[value] ?? value.charAt(0).toUpperCase() + value.slice(1);
}

/** Maps a domain status/priority string to a themed badge. */
export function StatusBadge({ value }: { value: string }) {
  return <Badge variant={STATUS_VARIANT[value] ?? "secondary"}>{humanize(value)}</Badge>;
}
