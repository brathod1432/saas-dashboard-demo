"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TimeSeriesPoint } from "@/lib/types";
import { formatCompact } from "@/lib/utils";

const AXIS = "hsl(var(--muted-foreground))";
const GRID = "hsl(var(--border))";
const SERIES = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--popover-foreground))",
};

/** Revenue vs target with an expenses overlay. */
export function RevenueChart({ data }: { data: TimeSeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SERIES[0]} stopOpacity={0.3} />
            <stop offset="100%" stopColor={SERIES[0]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis
          dataKey="date"
          stroke={AXIS}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke={AXIS}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => formatCompact(Number(v))}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v) => formatCompact(Number(v))}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area
          type="monotone"
          name="Revenue"
          dataKey="revenue"
          stroke={SERIES[0]}
          strokeWidth={2}
          fill="url(#rev)"
        />
        <Line
          type="monotone"
          name="Target"
          dataKey="target"
          stroke={SERIES[2]}
          strokeDasharray="4 4"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** New vs churned users as grouped bars. */
export function UsersBarChart({ data }: { data: TimeSeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis
          dataKey="date"
          stroke={AXIS}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis stroke={AXIS} fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar name="New" dataKey="new" fill={SERIES[1]} radius={[4, 4, 0, 0]} />
        <Bar name="Churned" dataKey="churned" fill={SERIES[2]} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Active users trend line. */
export function TrendLineChart({
  data,
  dataKey = "active",
  name = "Active users",
}: {
  data: TimeSeriesPoint[];
  dataKey?: string;
  name?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis
          dataKey="date"
          stroke={AXIS}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke={AXIS}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => formatCompact(Number(v))}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v) => formatCompact(Number(v))}
        />
        <Line
          type="monotone"
          name={name}
          dataKey={dataKey}
          stroke={SERIES[0]}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Acquisition channel share as horizontal bars with per-series colors. */
export function ChannelBarChart({ data }: { data: TimeSeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 16, bottom: 0, left: 16 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
        <XAxis
          type="number"
          stroke={AXIS}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="date"
          stroke={AXIS}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={70}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
        />
        <Bar name="Share %" dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={SERIES[index % SERIES.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
