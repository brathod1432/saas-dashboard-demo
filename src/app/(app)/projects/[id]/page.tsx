import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/server";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { projectsRepository } from "@/lib/api/repositories/projects";
import { customersRepository } from "@/lib/api/repositories/customers";
import { findUserById } from "@/lib/auth/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = projectsRepository.getById(id);
  return { title: project ? project.name : "Project" };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("projects:view");
  const { id } = await params;
  const project = projectsRepository.getById(id);
  if (!project) notFound();

  const customer = customersRepository.getById(project.customerId);
  const lead = findUserById(project.leadId);
  const utilization = project.budget > 0 ? project.spent / project.budget : 0;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[{ label: "Projects", href: "/projects" }, { label: project.name }]}
      />

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <StatusBadge value={project.status} />
          <StatusBadge value={project.priority} />
          {customer && (
            <Link
              href={`/customers/${customer.id}`}
              className="text-primary hover:underline"
            >
              {customer.name}
            </Link>
          )}
          {project.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-muted-foreground text-sm">Progress</p>
            <p className="text-2xl font-semibold">{project.progress}%</p>
            <Progress value={project.progress} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-muted-foreground text-sm">Budget</p>
            <p className="text-2xl font-semibold">{formatCurrency(project.budget)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-muted-foreground text-sm">Spent</p>
            <p className="text-2xl font-semibold">{formatCurrency(project.spent)}</p>
            <Progress
              value={Math.min(100, utilization * 100)}
              className="mt-2 h-1.5"
              indicatorClassName={utilization > 0.9 ? "bg-destructive" : undefined}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-muted-foreground text-sm">Project lead</p>
            <p className="text-lg font-semibold">{lead?.name ?? "—"}</p>
            <p className="text-muted-foreground text-xs">{lead?.title}</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-sm">Start date</p>
            <p className="font-medium">{formatDate(project.startDate)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Due date</p>
            <p className="font-medium">{formatDate(project.dueDate)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
