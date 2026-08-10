import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { requirePermission } from "@/lib/auth/server";
import { analyticsRepository } from "@/lib/api/repositories/analytics";
import { customersRepository } from "@/lib/api/repositories/customers";
import { projectsRepository } from "@/lib/api/repositories/projects";
import { listAudit } from "@/lib/audit";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/charts/charts";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { DeniedToast } from "@/components/dashboard/denied-toast";
import { formatDate, formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requirePermission("dashboard:view");
  const kpis = analyticsRepository.kpis();
  const revenue = analyticsRepository.revenueSeries();
  const activities = analyticsRepository.activities(6);
  const alerts = analyticsRepository.alerts();
  const recentCustomers = customersRepository.all().slice(0, 5);
  const recentProjects = projectsRepository.all().slice(0, 5);
  const recentAudit = listAudit(5);

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <DeniedToast />
      </Suspense>

      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here's what's happening across your operations today."
      />

      {/* KPIs */}
      <section
        aria-label="Key performance indicators"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {kpis.map((kpi) => (
          <StatCard key={kpi.id} kpi={kpi} />
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue vs. target</CardTitle>
            <CardDescription>Last 12 months, including expenses trend</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenue} />
          </CardContent>
        </Card>

        {/* Quick actions + alerts */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent>
              <QuickActions />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <AlertsPanel alerts={alerts} />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent customers */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent customers</CardTitle>
            <Link
              href="/customers"
              className="text-primary inline-flex items-center gap-1 text-sm hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentCustomers.map((customer) => (
              <div key={customer.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{customer.name}</p>
                  <p className="text-muted-foreground text-xs">{customer.industry}</p>
                </div>
                <StatusBadge value={customer.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent projects */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent projects</CardTitle>
            <Link
              href="/projects"
              className="text-primary inline-flex items-center gap-1 text-sm hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentProjects.map((project) => (
              <div key={project.id} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{project.name}</p>
                  <span className="text-muted-foreground text-xs">
                    {project.progress}%
                  </span>
                </div>
                <Progress value={project.progress} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed activities={activities} />
          </CardContent>
        </Card>
      </div>

      {/* Audit trail preview */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Audit trail</CardTitle>
            <CardDescription>Latest security-relevant events</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentAudit.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between gap-4 border-b py-2 text-sm last:border-0"
            >
              <div className="flex items-center gap-3">
                <StatusBadge
                  value={
                    entry.severity === "critical"
                      ? "critical"
                      : entry.severity === "warning"
                        ? "high"
                        : "low"
                  }
                />
                <span className="font-mono text-xs">{entry.action}</span>
                <span className="text-muted-foreground hidden sm:inline">
                  {entry.actorName}
                </span>
              </div>
              <span
                className="text-muted-foreground text-xs"
                title={formatDate(entry.timestamp)}
              >
                {formatRelativeTime(entry.timestamp)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
