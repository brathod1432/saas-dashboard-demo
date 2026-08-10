"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import type { Customer } from "@/lib/types";
import { useCustomers } from "@/hooks/use-customers";
import { DataTable, type Column } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ErrorState, TableSkeleton } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Can } from "@/components/auth/can";
import { CreateCustomerDialog } from "./create-customer-dialog";
import { findUserById } from "@/lib/auth/users";
import { formatCurrency, formatDate } from "@/lib/utils";

const columns: Column<Customer>[] = [
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Manage accounts, health, and revenue relationships."
        actions={
          <Can permission="customers:create">
            <CreateCustomerDialog
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
        <TableSkeleton columns={7} />
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
          bulkActions={(selected) => (
            <span className="text-muted-foreground text-xs">
              {formatCurrency(selected.reduce((sum, c) => sum + c.mrr, 0))} combined MRR
            </span>
          )}
        />
      )}
    </div>
  );
}
