/**
 * Domain types for the Nexus Ops platform.
 * Single source of truth shared by mock data, repositories, services, and UI.
 */

export type Role = "admin" | "manager" | "user" | "viewer";

export type CustomerStatus = "active" | "churned" | "prospect" | "on_hold";
export type CustomerTier = "enterprise" | "business" | "startup";

export type ProjectStatus = "planning" | "active" | "on_hold" | "completed" | "cancelled";
export type ProjectPriority = "low" | "medium" | "high" | "critical";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "void";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarColor: string;
  title: string;
  department: string;
  lastActiveAt: string;
}

export interface Customer {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  tier: CustomerTier;
  industry: string;
  mrr: number;
  healthScore: number; // 0-100
  createdAt: string;
  ownerId: string;
}

export interface Project {
  id: string;
  name: string;
  customerId: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number; // 0-100
  budget: number;
  spent: number;
  startDate: string;
  dueDate: string;
  leadId: string;
  tags: string[];
}

export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  status: InvoiceStatus;
  amount: number;
  issuedAt: string;
  dueAt: string;
  paidAt: string | null;
}

export type ActivityType = "customer" | "project" | "invoice" | "user" | "system";

export interface Activity {
  id: string;
  type: ActivityType;
  actorId: string;
  message: string;
  timestamp: string;
}

export type AuditAction =
  | "auth.login"
  | "auth.logout"
  | "profile.update"
  | "project.update"
  | "project.create"
  | "project.delete"
  | "invoice.create"
  | "settings.change"
  | "customer.create"
  | "customer.update"
  | "customer.delete"
  | "access.denied";

export type AuditSeverity = "info" | "warning" | "critical";

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  actorId: string;
  actorName: string;
  target: string;
  severity: AuditSeverity;
  ip: string;
  timestamp: string;
}

export type AlertLevel = "info" | "success" | "warning" | "critical";

export interface Alert {
  id: string;
  level: AlertLevel;
  title: string;
  description: string;
  timestamp: string;
}

export interface Kpi {
  id: string;
  label: string;
  value: number;
  format: "currency" | "number" | "percent";
  delta: number; // fractional change vs previous period
  spark: number[];
}

export interface TimeSeriesPoint {
  date: string;
  [series: string]: string | number;
}

/** Generic paginated result returned by the API layer. */
export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Query params accepted by list endpoints. */
export interface ListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  status?: string;
}
