import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/server";
import { analyticsRepository } from "@/lib/api/repositories/analytics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import {
  ChannelBarChart,
  TrendLineChart,
  UsersBarChart,
} from "@/components/charts/charts";
import { formatCompact } from "@/lib/utils";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  await requirePermission("analytics:view");
  const users = analyticsRepository.userGrowthSeries();
  const channels = analyticsRepository.channelSeries();
  const latest = users[users.length - 1];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Engagement, acquisition, and retention insights."
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-muted-foreground text-sm">Active users</p>
            <p className="text-2xl font-semibold">
              {formatCompact(Number(latest.active))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-muted-foreground text-sm">New this month</p>
            <p className="text-success text-2xl font-semibold">
              +{formatCompact(Number(latest.new))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-muted-foreground text-sm">Churned this month</p>
            <p className="text-destructive text-2xl font-semibold">
              {formatCompact(Number(latest.churned))}
            </p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Active users trend</CardTitle>
          <CardDescription>Monthly active users over the last year</CardDescription>
        </CardHeader>
        <CardContent>
          <TrendLineChart data={users} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Acquisition channels</CardTitle>
            <CardDescription>Share of new signups by channel</CardDescription>
          </CardHeader>
          <CardContent>
            <ChannelBarChart data={channels} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Growth breakdown</CardTitle>
            <CardDescription>New vs. churned users</CardDescription>
          </CardHeader>
          <CardContent>
            <UsersBarChart data={users} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
