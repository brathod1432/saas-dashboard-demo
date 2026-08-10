"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MoreHorizontal, Plus, Eye, Pencil, Trash2, Upload } from "lucide-react";
import type { Customer } from "@/lib/types";
import { useCustomers, useDeleteCustomer } from "@/hooks/use-customers";
import { DataTable, type Column } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ErrorState, TableSkeleton } from "@/components/shared/states";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Can, useCan } from "@/components/auth/can";
import { CustomerFormDialog } from "./customer-form-dialog";
import { CustomerBulkBar } from "./customer-bulk-bar";
import { ImportCustomersDialog } from "./import-customers-dialog";
import { findUserById } from "@/lib/auth/users";
import { formatCurrency, formatDate } from "@/lib/utils";

const baseColumns: Column<Customer>[] = [
  {
    key: "name",
    header: "Company",
    sortable: true,
    sortValue: (c) => c.name,
    exportValue: (c) => c.name,
    cell: (c) => (
      <div>
        <p className="font-medium">{c.name}</p>
        <p className="text-muted-foreground text-xs">{c.contactName}</p>
      </div>
    ),
  },
  {
    key: "industry",
    header: "Industry",
    sortable: true,
    sortValue: (c) => c.industry,
    exportValue: (c) => c.industry,
    cell: (c) => c.industry,
  },
  {
    key: "tier",
    header: "Tier",
    sortable: true,
    sortValue: (c) => c.tier,
    exportValue: (c) => c.tier,
    cell: (c) => <span className="capitalize">{c.tier}</span>,
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    sortValue: (c) => c.status,
    exportValue: (c) => c.status,
    cell: (c) => <StatusBadge value={c.status} />,
  },
  {
    key: "mrr",
    header: "MRR",
    sortable: true,
    sortValue: (c) => c.mrr,
    exportValue: (c) => String(c.mrr),
    className: "text-right",
    cell: (c) => <span className="tabular-nums">{formatCurrency(c.mrr)}</span>,
  },
  {
    key: "health",
    header: "Health",
    sortable: true,
    sortValue: (c) => c.healthScore,
    exportValue: (c) => String(c.healthScore),
    cell: (c) => (
      <span
        className={
          c.healthScore >= 70
            ? "text-success"
            : c.healthScore >= 50
              ? "text-warning"
              : "text-destructive"
        }
      >
        {c.healthScore}
      </span>
    ),
  },
  {
    key: "owner",
    header: "Owner",
    exportValue: (c) => findUserById(c.ownerId)?.name ?? "",
    cell: (c) => findUserById(c.ownerId)?.name ?? "—",
  },
  {
    key: "createdAt",
    header: "Created",
    sortable: true,
    sortValue: (c) => c.createdAt,
    exportValue: (c) => c.createdAt,
    cell: (c) => formatDate(c.createdAt),
  },
];

const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Prospect", value: "prospect" },
  { label: "On hold", value: "on_hold" },
  { label: "Churned", value: "churned" },
];

export function CustomersClient() {
  const router = useRouter();
  const params = useSearchParams();
  const { data, isLoading, isError, refetch } = useCustomers();
  const deleteCustomer = useDeleteCustomer();
  const canEdit = useCan("customers:edit");
  const canDelete = useCan("customers:delete");

  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);

  const columns: Column<Customer>[] = [
    ...baseColumns,
    {
      key: "actions",
      header: "",
      hideable: false,
      className: "w-10 text-right",
      cell: (customer) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label={`Actions for ${customer.name}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/customers/${customer.id}`)}>
                <Eye className="h-4 w-4" /> View
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem onClick={() => setEditing(customer)}>
                  <Pencil className="h-4 w-4" /> Edit
                </DropdownMenuItem>
              )}
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setDeleting(customer)}
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Manage accounts, health, and revenue relationships."
        actions={
          <Can permission="customers:create">
            <ImportCustomersDialog
              trigger={
                <Button variant="outline">
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
              }
            />
            <CustomerFormDialog
              mode="create"
              openSignal={params.get("new") === "1"}
              trigger={
                <Button>
                  <Plus className="h-4 w-4" />
                  New customer
                </Button>
              }
            />
          </Can>
        }
      />

      {isLoading ? (
        <TableSkeleton columns={8} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <DataTable
          data={data ?? []}
          columns={columns}
          getRowId={(c) => c.id}
          searchableText={(c) => `${c.name} ${c.contactName} ${c.email} ${c.industry}`}
          searchPlaceholder="Search customers…"
          statusOptions={STATUS_OPTIONS}
          statusOf={(c) => c.status}
          exportFileName="customers"
          onRowClick={(c) => router.push(`/customers/${c.id}`)}
          bulkActions={(selected, clear) => (
            <CustomerBulkBar selected={selected} clear={clear} />
          )}
        />
      )}

      {/* Edit dialog (mounted per selected row so defaults are correct) */}
      {editing && (
        <CustomerFormDialog
          key={editing.id}
          mode="edit"
          customer={editing}
          open={Boolean(editing)}
          onOpenChange={(o) => !o && setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete customer?"
        description={
          deleting
            ? `This permanently removes "${deleting.name}" and cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        loading={deleteCustomer.isPending}
        onConfirm={() => {
          if (!deleting) return;
          deleteCustomer.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
        }}
      />
    </div>
  );
}
