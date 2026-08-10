"use client";

import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import type { Invoice } from "@/lib/types";
import { useInvoices } from "@/hooks/use-invoices";
import { useCustomers } from "@/hooks/use-customers";
import { DataTable, type Column } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ErrorState, TableSkeleton } from "@/components/shared/states";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Can } from "@/components/auth/can";
import { CreateInvoiceDialog } from "./create-invoice-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Paid", value: "paid" },
  { label: "Overdue", value: "overdue" },
  { label: "Void", value: "void" },
];

export function InvoicesClient() {
  const params = useSearchParams();
  const { data, isLoading, isError, refetch } = useInvoices();
  const { data: customers } = useCustomers();

  const customerName = (id: string) => customers?.find((c) => c.id === id)?.name ?? "—";

  const invoices = data ?? [];
  const paid = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.amount, 0);
  const outstanding = invoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((s, i) => s + i.amount, 0);
  const overdue = invoices
    .filter((i) => i.status === "overdue")
    .reduce((s, i) => s + i.amount, 0);

  const columns: Column<Invoice>[] = [
    {
      key: "number",
      header: "Invoice",
      sortable: true,
      sortValue: (i) => i.number,
      exportValue: (i) => i.number,
      cell: (i) => <span className="font-mono text-xs">{i.number}</span>,
    },
    {
      key: "customer",
      header: "Customer",
      exportValue: (i) => customerName(i.customerId),
      cell: (i) => customerName(i.customerId),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortValue: (i) => i.status,
      exportValue: (i) => i.status,
      cell: (i) => <StatusBadge value={i.status} />,
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      sortValue: (i) => i.amount,
      exportValue: (i) => String(i.amount),
      className: "text-right",
      cell: (i) => <span className="tabular-nums">{formatCurrency(i.amount)}</span>,
    },
    {
      key: "issuedAt",
      header: "Issued",
      sortable: true,
      sortValue: (i) => i.issuedAt,
      exportValue: (i) => i.issuedAt,
      cell: (i) => formatDate(i.issuedAt),
    },
    {
      key: "dueAt",
      header: "Due",
      sortable: true,
      sortValue: (i) => i.dueAt,
      exportValue: (i) => i.dueAt,
      cell: (i) => formatDate(i.dueAt),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Billing, payment status, and outstanding balances."
        actions={
          <Can permission="invoices:create">
            <CreateInvoiceDialog
              openSignal={params.get("new") === "1"}
              trigger={
                <Button>
                  <Plus className="h-4 w-4" />
                  New invoice
                </Button>
              }
            />
          </Can>
        }
      />

      {!isLoading && !isError && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <p className="text-muted-foreground text-sm">Collected</p>
              <p className="text-success text-2xl font-semibold">
                {formatCurrency(paid)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-muted-foreground text-sm">Outstanding</p>
              <p className="text-2xl font-semibold">{formatCurrency(outstanding)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-muted-foreground text-sm">Overdue</p>
              <p className="text-destructive text-2xl font-semibold">
                {formatCurrency(overdue)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading ? (
        <TableSkeleton columns={6} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <DataTable
          data={invoices}
          columns={columns}
          getRowId={(i) => i.id}
          searchableText={(i) => `${i.number} ${customerName(i.customerId)} ${i.status}`}
          searchPlaceholder="Search invoices…"
          statusOptions={STATUS_OPTIONS}
          statusOf={(i) => i.status}
          exportFileName="invoices"
          bulkActions={(selected) => (
            <span className="text-muted-foreground text-xs">
              {formatCurrency(selected.reduce((sum, i) => sum + i.amount, 0))} total
            </span>
          )}
        />
      )}
    </div>
  );
}
