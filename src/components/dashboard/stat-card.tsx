"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCompact, formatCurrency, formatPercent } from "@/lib/utils";
import type { Kpi } from "@/lib/types";

function formatValue(kpi: Kpi): string {
  if (kpi.format === "currency") return formatCurrency(kpi.value);
  if (kpi.format === "percent") return formatPercent(kpi.value);
  return formatCompact(kpi.value);
}

export function StatCard({ kpi }: { kpi: Kpi }) {
  // For churn, a negative delta is good; for others positive is good.
  const goodWhenNegative = kpi.id === "kpi_churn";
  const isPositive = kpi.delta >= 0;
  const isGood = goodWhenNegative ? !isPositive : isPositive;
  const data = kpi.spark.map((value, index) => ({ index, value }));
  const strokeColor = isGood ? "hsl(var(--success))" : "hsl(var(--destructive))";

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">{kpi.label}</p>
            <p className="text-2xl font-semibold tracking-tight">{formatValue(kpi)}</p>
          </div>
          <div className="h-12 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 4, bottom: 4, left: 0, right: 0 }}>
                <defs>
                  <linearGradient id={`spark-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={strokeColor} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={strokeColor}
                  strokeWidth={2}
                  fill={`url(#spark-${kpi.id})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div
          className={cn(
            "mt-3 flex items-center gap-1 text-xs font-medium",
            isGood ? "text-success" : "text-destructive"
          )}
        >
          {isPositive ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" />
          )}
          {formatPercent(Math.abs(kpi.delta))}
          <span className="text-muted-foreground font-normal">vs last period</span>
        </div>
      </CardContent>
    </Card>
  );
}
