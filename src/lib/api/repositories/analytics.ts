import { db } from "@/lib/mock/data";
import type { Activity, Alert, Kpi, TimeSeriesPoint } from "@/lib/types";

/** Read-only aggregates for the dashboard, reports, and analytics pages. */
export const analyticsRepository = {
  kpis(): Kpi[] {
    return [...db.kpis];
  },
  revenueSeries(): TimeSeriesPoint[] {
    return [...db.revenueSeries];
  },
  userGrowthSeries(): TimeSeriesPoint[] {
    return [...db.userGrowthSeries];
  },
  channelSeries(): TimeSeriesPoint[] {
    return [...db.channelSeries];
  },
  activities(limit = 8): Activity[] {
    return db.activities.slice(0, limit);
  },
  alerts(): Alert[] {
    return [...db.alerts];
  },
  summary() {
    const activeCustomers = db.customers.filter((c) => c.status === "active").length;
    const activeProjects = db.projects.filter((p) => p.status === "active").length;
    const overdueInvoices = db.invoices.filter((i) => i.status === "overdue");
    const outstanding = db.invoices
      .filter((i) => i.status === "sent" || i.status === "overdue")
      .reduce((sum, i) => sum + i.amount, 0);
    return {
      activeCustomers,
      totalCustomers: db.customers.length,
      activeProjects,
      totalProjects: db.projects.length,
      overdueCount: overdueInvoices.length,
      overdueAmount: overdueInvoices.reduce((s, i) => s + i.amount, 0),
      outstanding,
    };
  },
};
