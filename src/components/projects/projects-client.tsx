"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MoreHorizontal, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import type { Project } from "@/lib/types";
import { useProjects, useDeleteProject } from "@/hooks/use-projects";
import { useCustomers } from "@/hooks/use-customers";
import { DataTable, type Column } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ErrorState, TableSkeleton } from "@/components/shared/states";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Can, useCan } from "@/components/auth/can";
import { ProjectFormDialog } from "./project-form-dialog";
import { ProjectBulkBar } from "./project-bulk-bar";
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
  const deleteProject = useDeleteProject();
  const canEdit = useCan("projects:edit");
  const canDelete = useCan("projects:delete");

  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);

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
    {
      key: "actions",
      header: "",
      hideable: false,
      className: "w-10 text-right",
      cell: (project) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label={`Actions for ${project.name}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}`)}>
                <Eye className="h-4 w-4" /> View
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem onClick={() => setEditing(project)}>
                  <Pencil className="h-4 w-4" /> Edit
                </DropdownMenuItem>
              )}
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setDeleting(project)}
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
        title="Projects"
        description="Track delivery, budgets, and progress across accounts."
        actions={
          <Can permission="projects:create">
            <ProjectFormDialog
              mode="create"
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
        <TableSkeleton columns={8} />
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
          bulkActions={(selected, clear) => (
            <ProjectBulkBar selected={selected} clear={clear} />
          )}
        />
      )}

      {editing && (
        <ProjectFormDialog
          key={editing.id}
          mode="edit"
          project={editing}
          open={Boolean(editing)}
          onOpenChange={(o) => !o && setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete project?"
        description={
          deleting
            ? `This permanently removes "${deleting.name}" and cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        loading={deleteProject.isPending}
        onConfirm={() => {
          if (!deleting) return;
          deleteProject.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
        }}
      />
    </div>
  );
}
