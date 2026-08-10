"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import type { Project } from "@/lib/types";
import { useProjects } from "@/hooks/use-projects";
import { useCustomers } from "@/hooks/use-customers";
import { DataTable, type Column } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ErrorState, TableSkeleton } from "@/components/shared/states";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Can } from "@/components/auth/can";
import { CreateProjectDialog } from "./create-project-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_OPTIONS = [
  { label: "Planning", value: "planning" },
  { label: "Active", value: "active" },
  { label: "On hold", value: "on_hold" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export function ProjectsClient() {
  const router = useRouter();
  const params = useSearchParams();
  const { data, isLoading, isError, refetch } = useProjects();
  const { data: customers } = useCustomers();

  const customerName = (id: string) => customers?.find((c) => c.id === id)?.name ?? "—";

  const columns: Column<Project>[] = [
    {
      key: "name",
      header: "Project",
      sortable: true,
      sortValue: (p) => p.name,
      exportValue: (p) => p.name,
      cell: (p) => <span className="font-medium">{p.name}</span>,
    },
    {
      key: "customer",
      header: "Customer",
      exportValue: (p) => customerName(p.customerId),
      cell: (p) => customerName(p.customerId),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortValue: (p) => p.status,
      exportValue: (p) => p.status,
      cell: (p) => <StatusBadge value={p.status} />,
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      sortValue: (p) => p.priority,
      exportValue: (p) => p.priority,
      cell: (p) => <StatusBadge value={p.priority} />,
    },
    {
      key: "progress",
      header: "Progress",
      sortable: true,
      sortValue: (p) => p.progress,
      exportValue: (p) => `${p.progress}%`,
      className: "w-40",
      cell: (p) => (
        <div className="flex items-center gap-2">
          <Progress value={p.progress} className="h-1.5" />
          <span className="text-muted-foreground text-xs tabular-nums">
            {p.progress}%
          </span>
        </div>
      ),
    },
    {
      key: "budget",
      header: "Budget",
      sortable: true,
      sortValue: (p) => p.budget,
      exportValue: (p) => String(p.budget),
      className: "text-right",
      cell: (p) => <span className="tabular-nums">{formatCurrency(p.budget)}</span>,
    },
    {
      key: "dueDate",
      header: "Due",
      sortable: true,
      sortValue: (p) => p.dueDate,
      exportValue: (p) => p.dueDate,
      cell: (p) => formatDate(p.dueDate),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Track delivery, budgets, and progress across accounts."
        actions={
          <Can permission="projects:create">
            <CreateProjectDialog
              openSignal={params.get("new") === "1"}
              trigger={
                <Button>
                  <Plus className="h-4 w-4" />
                  New project
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
          getRowId={(p) => p.id}
          searchableText={(p) => `${p.name} ${p.status} ${p.priority}`}
          searchPlaceholder="Search projects…"
          statusOptions={STATUS_OPTIONS}
          statusOf={(p) => p.status}
          exportFileName="projects"
          onRowClick={(p) => router.push(`/projects/${p.id}`)}
          bulkActions={(selected) => (
            <span className="text-muted-foreground text-xs">
              {formatCurrency(selected.reduce((sum, p) => sum + p.budget, 0))} combined
              budget
            </span>
          )}
        />
      )}
    </div>
  );
}
