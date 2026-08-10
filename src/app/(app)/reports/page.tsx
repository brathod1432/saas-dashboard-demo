import { Suspense } from "react";
import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/server";
import { analyticsRepository } from "@/lib/api/repositories/analytics";
import { customersRepository } from "@/lib/api/repositories/customers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { RevenueChart, UsersBarChart } from "@/components/charts/charts";
import { PeriodSelector } from "@/components/reports/period-selector";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Reports" };

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  await requirePermission("reports:view");
  const { period } = await searchParams;
  const months = [3, 6, 12].includes(Number(period)) ? Number(period) : 12;

  const revenue = analyticsRepository.revenueSeries().slice(-months);
  const users = analyticsRepository.userGrowthSeries().slice(-months);
  const summary = analyticsRepository.summary();
  const topCustomers = [...customersRepository.all()]
    .sort((a, b) => b.mrr - a.mrr)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description={`Revenue, users, and account performance over the last ${months} months.`}
        actions={
          <Suspense fallback={null}>
            <PeriodSelector />
          </Suspense>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-muted-foreground text-sm">Outstanding</p>
            <p className="text-2xl font-semibold">
              {formatCurrency(summary.outstanding)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-muted-foreground text-sm">Active customers</p>
            <p className="text-2xl font-semibold">
              {summary.activeCustomers}
              <span className="text-muted-foreground text-base font-normal">
                {" "}
                / {summary.totalCustomers}
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-muted-foreground text-sm">Active projects</p>
            <p className="text-2xl font-semibold">
              {summary.activeProjects}
              <span className="text-muted-foreground text-base font-normal">
                {" "}
                / {summary.totalProjects}
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-muted-foreground text-sm">Overdue invoices</p>
            <p className="text-destructive text-2xl font-semibold">
              {summary.overdueCount}
            </p>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue report</CardTitle>
            <CardDescription>Monthly revenue vs. target</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenue} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>User growth report</CardTitle>
            <CardDescription>New vs. churned users per month</CardDescription>
          </CardHeader>
          <CardContent>
            <UsersBarChart data={users} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top customers by MRR</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topCustomers.map((customer) => {
            const max = topCustomers[0].mrr;
            return (
              <div key={customer.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{customer.name}</span>
                  <span className="tabular-nums">{formatCurrency(customer.mrr)}</span>
                </div>
                <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${(customer.mrr / max) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
