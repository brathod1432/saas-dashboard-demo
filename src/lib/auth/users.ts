import type { User } from "@/lib/types";

/**
 * Seeded demo team. In a real system these come from an identity provider.
 * The shared demo password is intentionally public — this is a demo, not prod.
 */
export const DEMO_PASSWORD = "password";

export const DEMO_USERS: User[] = [
  {
    id: "usr_admin",
    name: "Priya Sharma",
    email: "admin@nexusops.demo",
    role: "admin",
    avatarColor: "#6366f1",
    title: "Head of Operations",
    department: "Operations",
    lastActiveAt: "2026-08-10T08:15:00.000Z",
  },
  {
    id: "usr_manager",
    name: "Marco Ferreira",
    email: "manager@nexusops.demo",
    role: "manager",
    avatarColor: "#0ea5e9",
    title: "Team Manager",
    department: "Delivery",
    lastActiveAt: "2026-08-10T07:52:00.000Z",
  },
  {
    id: "usr_user",
    name: "Dana Okoro",
    email: "user@nexusops.demo",
    role: "user",
    avatarColor: "#22c55e",
    title: "Account Specialist",
    department: "Customer Success",
    lastActiveAt: "2026-08-09T16:40:00.000Z",
  },
  {
    id: "usr_viewer",
    name: "Sam Lindqvist",
    email: "viewer@nexusops.demo",
    role: "viewer",
    avatarColor: "#f59e0b",
    title: "VP Finance",
    department: "Finance",
    lastActiveAt: "2026-08-10T06:05:00.000Z",
  },
  {
    id: "usr_lena",
    name: "Lena Alvarez",
    email: "lena@nexusops.demo",
    role: "manager",
    avatarColor: "#a855f7",
    title: "Delivery Lead",
    department: "Delivery",
    lastActiveAt: "2026-08-08T12:20:00.000Z",
  },
  {
    id: "usr_kai",
    name: "Kai Tanaka",
    email: "kai@nexusops.demo",
    role: "user",
    avatarColor: "#14b8a6",
    title: "Solutions Engineer",
    department: "Engineering",
    lastActiveAt: "2026-08-09T09:10:00.000Z",
  },
];

export function findUserByEmail(email: string): User | undefined {
  return DEMO_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

export function findUserById(id: string): User | undefined {
  return DEMO_USERS.find((u) => u.id === id);
}
