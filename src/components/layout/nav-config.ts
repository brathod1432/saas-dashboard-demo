import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  BarChart3,
  LineChart,
  ShieldCheck,
  Settings,
  UserCircle,
  LifeBuoy,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { Permission } from "@/lib/rbac";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: Permission;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        permission: "dashboard:view",
      },
    ],
  },
  {
    title: "Workspace",
    items: [
      {
        label: "Customers",
        href: "/customers",
        icon: Users,
        permission: "customers:view",
      },
      {
        label: "Projects",
        href: "/projects",
        icon: FolderKanban,
        permission: "projects:view",
      },
      {
        label: "Invoices",
        href: "/invoices",
        icon: FileText,
        permission: "invoices:view",
      },
    ],
  },
  {
    title: "Insights",
    items: [
      { label: "Reports", href: "/reports", icon: BarChart3, permission: "reports:view" },
      {
        label: "Analytics",
        href: "/analytics",
        icon: LineChart,
        permission: "analytics:view",
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
        permission: "settings:view",
      },
      {
        label: "Account",
        href: "/account",
        icon: UserCircle,
        permission: "dashboard:view",
      },
      { label: "Help", href: "/help", icon: LifeBuoy, permission: "dashboard:view" },
      {
        label: "Showcase",
        href: "/showcase",
        icon: Sparkles,
        permission: "dashboard:view",
      },
    ],
  },
];

export const RBAC_NAV_ICON = ShieldCheck;
