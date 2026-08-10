"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { Project, ProjectStatus } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useCan } from "@/components/auth/can";
import { useBulkDeleteProjects, useBulkUpdateProjects } from "@/hooks/use-projects";
import { formatCurrency } from "@/lib/utils";

const STATUSES: ProjectStatus[] = [
  "planning",
  "active",
  "on_hold",
  "completed",
  "cancelled",
];

/** Bulk operations shown in the DataTable selection bar for projects. */
export function ProjectBulkBar({
  selected,
  clear,
}: {
  selected: Project[];
  clear: () => void;
}) {
  const canEdit = useCan("projects:edit");
  const canDelete = useCan("projects:delete");
  const bulkUpdate = useBulkUpdateProjects();
  const bulkDelete = useBulkDeleteProjects();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const ids = selected.map((p) => p.id);
  const totalBudget = selected.reduce((sum, p) => sum + p.budget, 0);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground text-xs">
        {formatCurrency(totalBudget)} combined budget
      </span>

      {canEdit && (
        <Select
          onValueChange={(status) =>
            bulkUpdate.mutate(
              { ids, patch: { status: status as ProjectStatus } },
              { onSuccess: clear }
            )
          }
        >
          <SelectTrigger className="h-8 w-36" aria-label="Set status for selected">
            <SelectValue placeholder="Set status…" />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {canDelete && (
        <Button
          variant="outline"
          size="sm"
          className="text-destructive"
          onClick={() => setConfirmOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete ${ids.length} project${ids.length === 1 ? "" : "s"}?`}
        description="This permanently removes the selected projects and cannot be undone."
        confirmLabel="Delete"
        loading={bulkDelete.isPending}
        onConfirm={() =>
          bulkDelete.mutate(ids, {
            onSuccess: () => {
              setConfirmOpen(false);
              clear();
            },
          })
        }
      />
    </div>
  );
}
