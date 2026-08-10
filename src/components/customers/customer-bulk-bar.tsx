"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { Customer, CustomerStatus } from "@/lib/types";
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
import { useBulkDeleteCustomers, useBulkUpdateCustomers } from "@/hooks/use-customers";
import { formatCurrency } from "@/lib/utils";

const STATUSES: CustomerStatus[] = ["active", "prospect", "on_hold", "churned"];

/** Bulk operations shown in the DataTable selection bar for customers. */
export function CustomerBulkBar({
  selected,
  clear,
}: {
  selected: Customer[];
  clear: () => void;
}) {
  const canEdit = useCan("customers:edit");
  const canDelete = useCan("customers:delete");
  const bulkUpdate = useBulkUpdateCustomers();
  const bulkDelete = useBulkDeleteCustomers();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const ids = selected.map((c) => c.id);
  const totalMrr = selected.reduce((sum, c) => sum + c.mrr, 0);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground text-xs">
        {formatCurrency(totalMrr)} combined MRR
      </span>

      {canEdit && (
        <Select
          onValueChange={(status) =>
            bulkUpdate.mutate(
              { ids, patch: { status: status as CustomerStatus } },
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
        title={`Delete ${ids.length} customer${ids.length === 1 ? "" : "s"}?`}
        description="This permanently removes the selected customers and cannot be undone."
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
