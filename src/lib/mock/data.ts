import type {
  Activity,
  Alert,
  AuditLogEntry,
  Customer,
  CustomerStatus,
  CustomerTier,
  Invoice,
  InvoiceStatus,
  Kpi,
  Project,
  ProjectPriority,
  ProjectStatus,
  TimeSeriesPoint,
} from "@/lib/types";
import { DEMO_USERS } from "@/lib/auth/users";

/** Deterministic PRNG (mulberry32) so demo data + tests are stable. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260810);
const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const between = (min: number, max: number): number =>
  Math.floor(rand() * (max - min + 1)) + min;
const isoDaysAgo = (days: number): string =>
  new Date(Date.now() - days * 86_400_000).toISOString();

const COMPANY_NAMES = [
  "Northwind Logistics",
  "Helios Health Systems",
  "Vertex Financial",
  "Aurora Retail Group",
  "Quantum Freight",
  "Meridian Care",
  "BluePeak Capital",
  "Cobalt Manufacturing",
  "Summit Insurance",
  "Evergreen Biotech",
  "Atlas Shipping Co",
  "Nova Payments",
  "Ironclad Security",
  "Pinnacle Analytics",
  "Riverstone Bank",
  "Solstice Energy",
  "Cascade Pharma",
  "Orbital Telecom",
  "Granite Legal",
  "Lumen Media",
  "Falcon Aerospace",
  "Harbor Health",
  "Titan Industrial",
  "Sapphire Hotels",
  "Delta Grocers",
  "Pioneer Robotics",
  "Zenith Software",
  "Emerald Realty",
];

const INDUSTRIES = [
  "Logistics",
  "Healthcare",
  "Finance",
  "Retail",
  "Manufacturing",
  "Insurance",
  "Biotech",
  "Energy",
  "Telecom",
  "Legal",
];

const CONTACTS = [
  "Alicia Grant",
  "Ben Carter",
  "Chloe Diaz",
  "Derek Owens",
  "Elena Rossi",
  "Frank Mensah",
  "Grace Kim",
  "Hassan Ali",
  "Isla Murphy",
  "Jonas Weber",
];

const CUSTOMER_STATUSES: CustomerStatus[] = [
  "active",
  "active",
  "active",
  "prospect",
  "on_hold",
  "churned",
];
const TIERS: CustomerTier[] = ["enterprise", "business", "startup"];

function makeCustomers(): Customer[] {
  return COMPANY_NAMES.map((name, i) => {
    const tier = pick(TIERS);
    const mrrBase =
      tier === "enterprise"
        ? between(18, 60)
        : tier === "business"
          ? between(6, 20)
          : between(1, 6);
    return {
      id: `cus_${String(i + 1).padStart(3, "0")}`,
      name,
      contactName: pick(CONTACTS),
      email: `contact@${name.toLowerCase().replace(/[^a-z]+/g, "")}.com`,
      phone: `+1 (${between(200, 989)}) ${between(200, 989)}-${between(1000, 9999)}`,
      status: pick(CUSTOMER_STATUSES),
      tier,
      industry: pick(INDUSTRIES),
      mrr: mrrBase * 1000,
      healthScore: between(35, 99),
      createdAt: isoDaysAgo(between(30, 900)),
      ownerId: pick(DEMO_USERS).id,
    };
  });
}

const PROJECT_STATUSES: ProjectStatus[] = [
  "planning",
  "active",
  "active",
  "on_hold",
  "completed",
  "cancelled",
];
const PRIORITIES: ProjectPriority[] = ["low", "medium", "high", "critical"];
const PROJECT_TAGS = [
  "onboarding",
  "migration",
  "integration",
  "compliance",
  "expansion",
  "renewal",
  "support",
  "analytics",
];
const PROJECT_PREFIXES = [
  "Platform",
  "Data",
  "Cloud",
  "Security",
  "Billing",
  "Portal",
  "Mobile",
  "Reporting",
];
const PROJECT_SUFFIXES = [
  "Migration",
  "Rollout",
  "Revamp",
  "Integration",
  "Upgrade",
  "Launch",
  "Automation",
];

function makeProjects(customers: Customer[]): Project[] {
  return Array.from({ length: 32 }, (_, i) => {
    const status = pick(PROJECT_STATUSES);
    const budget = between(20, 250) * 1000;
    const progress =
      status === "completed"
        ? 100
        : status === "planning"
          ? between(0, 20)
          : between(20, 95);
    return {
      id: `prj_${String(i + 1).padStart(3, "0")}`,
      name: `${pick(PROJECT_PREFIXES)} ${pick(PROJECT_SUFFIXES)}`,
      customerId: pick(customers).id,
      status,
      priority: pick(PRIORITIES),
      progress,
      budget,
      spent: Math.floor(budget * (progress / 100) * (0.7 + rand() * 0.5)),
      startDate: isoDaysAgo(between(30, 400)),
      dueDate: isoDaysAgo(-between(5, 180)),
      leadId: pick(DEMO_USERS).id,
      tags: [pick(PROJECT_TAGS), pick(PROJECT_TAGS)].filter(
        (v, idx, a) => a.indexOf(v) === idx
      ),
    };
  });
}

const INVOICE_STATUSES: InvoiceStatus[] = [
  "draft",
  "sent",
  "paid",
  "paid",
  "overdue",
  "void",
];

function makeInvoices(customers: Customer[]): Invoice[] {
  return Array.from({ length: 46 }, (_, i) => {
    const status = pick(INVOICE_STATUSES);
    const issuedDays = between(1, 200);
    return {
      id: `inv_${String(i + 1).padStart(3, "0")}`,
      number: `INV-2026-${String(i + 1).padStart(4, "0")}`,
      customerId: pick(customers).id,
      status,
      amount: between(2, 80) * 1000,
      issuedAt: isoDaysAgo(issuedDays),
      dueAt: isoDaysAgo(issuedDays - 30),
      paidAt: status === "paid" ? isoDaysAgo(issuedDays - between(1, 25)) : null,
    };
  });
}

function makeActivities(customers: Customer[], projects: Project[]): Activity[] {
  const templates: { type: Activity["type"]; msg: () => string }[] = [
    { type: "customer", msg: () => `created a new customer "${pick(customers).name}"` },
    { type: "project", msg: () => `updated project "${pick(projects).name}"` },
    { type: "invoice", msg: () => `issued invoice for ${pick(customers).name}` },
    { type: "project", msg: () => `moved "${pick(projects).name}" to active` },
    { type: "customer", msg: () => `flagged ${pick(customers).name} as at-risk` },
    { type: "system", msg: () => `ran the nightly data sync` },
    { type: "user", msg: () => `invited a new team member` },
  ];
  return Array.from({ length: 16 }, (_, i) => {
    const t = pick(templates);
    return {
      id: `act_${String(i + 1).padStart(3, "0")}`,
      type: t.type,
      actorId: pick(DEMO_USERS).id,
      message: t.msg(),
      timestamp: isoDaysAgo(rand() * 6),
    };
  }).sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
}

function makeAuditLog(): AuditLogEntry[] {
  const actions: {
    action: AuditLogEntry["action"];
    severity: AuditLogEntry["severity"];
    target: string;
  }[] = [
    { action: "auth.login", severity: "info", target: "session" },
    { action: "profile.update", severity: "info", target: "account/profile" },
    { action: "project.update", severity: "info", target: "prj_004" },
    { action: "invoice.create", severity: "info", target: "inv_012" },
    { action: "settings.change", severity: "warning", target: "settings/security" },
    { action: "customer.create", severity: "info", target: "cus_009" },
    { action: "access.denied", severity: "critical", target: "users:manage" },
    { action: "auth.logout", severity: "info", target: "session" },
  ];
  return Array.from({ length: 22 }, (_, i) => {
    const a = pick(actions);
    const actor = pick(DEMO_USERS);
    return {
      id: `aud_${String(i + 1).padStart(3, "0")}`,
      action: a.action,
      actorId: actor.id,
      actorName: actor.name,
      target: a.target,
      severity: a.severity,
      ip: `10.${between(0, 255)}.${between(0, 255)}.${between(1, 254)}`,
      timestamp: isoDaysAgo(rand() * 14),
    };
  }).sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
}

const ALERTS: Alert[] = [
  {
    id: "alr_001",
    level: "critical",
    title: "3 invoices overdue",
    description: "Total $84,000 past due across Northwind and Vertex.",
    timestamp: isoDaysAgo(0.2),
  },
  {
    id: "alr_002",
    level: "warning",
    title: "Customer health declining",
    description: "Meridian Care health score dropped below 50.",
    timestamp: isoDaysAgo(0.6),
  },
  {
    id: "alr_003",
    level: "info",
    title: "Quarterly review scheduled",
    description: "Ops review with leadership on Friday 10:00.",
    timestamp: isoDaysAgo(1.1),
  },
  {
    id: "alr_004",
    level: "success",
    title: "Renewal secured",
    description: "Aurora Retail Group renewed for 12 months.",
    timestamp: isoDaysAgo(1.8),
  },
];

const MONTHS = [
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
];

const revenueSeries: TimeSeriesPoint[] = MONTHS.map((m, i) => {
  const revenue = 320_000 + i * 18_000 + between(-15_000, 25_000);
  return {
    date: m,
    revenue,
    target: 330_000 + i * 16_000,
    expenses: Math.floor(revenue * (0.55 + rand() * 0.1)),
  };
});

const userGrowthSeries: TimeSeriesPoint[] = MONTHS.map((m, i) => ({
  date: m,
  active: 4200 + i * 260 + between(-120, 220),
  new: 320 + between(-60, 140),
  churned: 90 + between(-30, 60),
}));

const channelSeries: TimeSeriesPoint[] = [
  { date: "Organic", value: 38 },
  { date: "Referral", value: 24 },
  { date: "Paid", value: 19 },
  { date: "Partner", value: 12 },
  { date: "Direct", value: 7 },
];

const kpis: Kpi[] = [
  {
    id: "kpi_revenue",
    label: "Monthly Revenue",
    value: revenueSeries[revenueSeries.length - 1].revenue as number,
    format: "currency",
    delta: 0.082,
    spark: revenueSeries.slice(-7).map((p) => p.revenue as number),
  },
  {
    id: "kpi_active_users",
    label: "Active Users",
    value: userGrowthSeries[userGrowthSeries.length - 1].active as number,
    format: "number",
    delta: 0.041,
    spark: userGrowthSeries.slice(-7).map((p) => p.active as number),
  },
  {
    id: "kpi_growth",
    label: "Growth Rate",
    value: 0.128,
    format: "percent",
    delta: 0.015,
    spark: [0.09, 0.1, 0.105, 0.11, 0.118, 0.122, 0.128],
  },
  {
    id: "kpi_churn",
    label: "Churn Rate",
    value: 0.021,
    format: "percent",
    delta: -0.004,
    spark: [0.03, 0.028, 0.026, 0.025, 0.024, 0.022, 0.021],
  },
];

/** The seeded dataset. Frozen shallowly to discourage accidental mutation. */
const customers = makeCustomers();
const projects = makeProjects(customers);
const invoices = makeInvoices(customers);
const activities = makeActivities(customers, projects);
const auditLog = makeAuditLog();

export const db = {
  users: DEMO_USERS,
  customers,
  projects,
  invoices,
  activities,
  auditLog,
  alerts: ALERTS,
  kpis,
  revenueSeries,
  userGrowthSeries,
  channelSeries,
};

export type MockDb = typeof db;
