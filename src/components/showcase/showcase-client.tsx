"use client";

import { useState } from "react";
import {
  HeartPulse,
  Truck,
  Landmark,
  Users,
  Boxes,
  KanbanSquare,
  LayoutGrid,
  BarChart4,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Vertical {
  id: string;
  name: string;
  icon: LucideIcon;
  accent: string;
  tagline: string;
  modules: string[];
  kpis: { label: string; value: string }[];
}

const VERTICALS: Vertical[] = [
  {
    id: "healthcare",
    name: "Healthcare SaaS",
    icon: HeartPulse,
    accent: "0 72% 51%",
    tagline: "Patient operations & care coordination",
    modules: ["Patients", "Care Plans", "Claims", "Compliance", "Analytics"],
    kpis: [
      { label: "Active patients", value: "12,480" },
      { label: "Readmission rate", value: "4.2%" },
      { label: "Claims cleared", value: "$3.1M" },
      { label: "Care SLA", value: "98.1%" },
    ],
  },
  {
    id: "logistics",
    name: "Logistics SaaS",
    icon: Truck,
    accent: "217 91% 60%",
    tagline: "Fleet, freight & delivery visibility",
    modules: ["Shipments", "Fleet", "Routes", "Invoicing", "Analytics"],
    kpis: [
      { label: "On-time delivery", value: "96.4%" },
      { label: "Active shipments", value: "1,932" },
      { label: "Fleet utilization", value: "87%" },
      { label: "Cost / mile", value: "$1.42" },
    ],
  },
  {
    id: "finance",
    name: "Finance SaaS",
    icon: Landmark,
    accent: "142 71% 45%",
    tagline: "Accounts, portfolios & risk",
    modules: ["Accounts", "Portfolios", "Transactions", "Compliance", "Reports"],
    kpis: [
      { label: "AUM", value: "$412M" },
      { label: "Net inflows", value: "$8.4M" },
      { label: "Risk score", value: "Low" },
      { label: "Fraud flags", value: "3" },
    ],
  },
  {
    id: "crm",
    name: "CRM",
    icon: Users,
    accent: "243 75% 59%",
    tagline: "Leads, deals & customer success",
    modules: ["Leads", "Deals", "Contacts", "Pipeline", "Reports"],
    kpis: [
      { label: "Pipeline", value: "$2.6M" },
      { label: "Win rate", value: "31%" },
      { label: "Open deals", value: "184" },
      { label: "Avg cycle", value: "27d" },
    ],
  },
  {
    id: "erp",
    name: "ERP",
    icon: Boxes,
    accent: "280 65% 60%",
    tagline: "Inventory, orders & operations",
    modules: ["Inventory", "Orders", "Suppliers", "Finance", "Analytics"],
    kpis: [
      { label: "Inventory value", value: "$5.8M" },
      { label: "Open orders", value: "742" },
      { label: "Stockouts", value: "12" },
      { label: "Fulfillment", value: "94%" },
    ],
  },
  {
    id: "pm",
    name: "Project Management",
    icon: KanbanSquare,
    accent: "38 92% 50%",
    tagline: "Work, sprints & delivery",
    modules: ["Projects", "Tasks", "Sprints", "Timesheets", "Reports"],
    kpis: [
      { label: "Active projects", value: "58" },
      { label: "On track", value: "82%" },
      { label: "Overdue tasks", value: "37" },
      { label: "Velocity", value: "142" },
    ],
  },
  {
    id: "portal",
    name: "Customer Portal",
    icon: LayoutGrid,
    accent: "190 90% 42%",
    tagline: "Self-service & support",
    modules: ["Dashboard", "Tickets", "Billing", "Documents", "Profile"],
    kpis: [
      { label: "Open tickets", value: "126" },
      { label: "CSAT", value: "4.6/5" },
      { label: "Avg response", value: "2.1h" },
      { label: "Self-serve", value: "68%" },
    ],
  },
  {
    id: "analytics",
    name: "Analytics Platform",
    icon: BarChart4,
    accent: "222 47% 30%",
    tagline: "Metrics, cohorts & dashboards",
    modules: ["Dashboards", "Explore", "Cohorts", "Funnels", "Alerts"],
    kpis: [
      { label: "Events / day", value: "18.2M" },
      { label: "Active users", value: "94K" },
      { label: "Retention", value: "42%" },
      { label: "Dashboards", value: "312" },
    ],
  },
];

export function ShowcaseClient() {
  const [active, setActive] = useState(VERTICALS[3]);
  const Icon = active.icon;

  return (
    <div className="space-y-6">
      {/* Vertical picker */}
      <div className="flex flex-wrap gap-2">
        {VERTICALS.map((vertical) => {
          const VIcon = vertical.icon;
          const selected = vertical.id === active.id;
          return (
            <button
              key={vertical.id}
              onClick={() => setActive(vertical)}
              aria-pressed={selected}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
                selected ? "text-white" : "hover:bg-accent"
              )}
              style={
                selected
                  ? {
                      backgroundColor: `hsl(${vertical.accent})`,
                      borderColor: `hsl(${vertical.accent})`,
                    }
                  : undefined
              }
            >
              <VIcon className="h-4 w-4" />
              {vertical.name}
            </button>
          );
        })}
      </div>

      {/* Preview */}
      <Card style={{ ["--preview-accent" as string]: `hsl(${active.accent})` }}>
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: `hsl(${active.accent})` }}
          >
            <Icon className="h-6 w-6" />
          </span>
          <div>
            <CardTitle>{active.name}</CardTitle>
            <p className="text-muted-foreground text-sm">{active.tagline}</p>
          </div>
          <Badge variant="secondary" className="ml-auto">
            Same starter, re-themed
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
              Navigation
            </p>
            <div className="flex flex-wrap gap-2">
              {active.modules.map((module) => (
                <span
                  key={module}
                  className="rounded-md border px-3 py-1.5 text-sm"
                  style={{ borderColor: `hsl(${active.accent} / 0.4)` }}
                >
                  {module}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
              KPIs
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {active.kpis.map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-lg border p-4"
                  style={{ borderColor: `hsl(${active.accent} / 0.3)` }}
                >
                  <p className="text-muted-foreground text-sm">{kpi.label}</p>
                  <p
                    className="text-2xl font-semibold"
                    style={{ color: `hsl(${active.accent})` }}
                  >
                    {kpi.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
