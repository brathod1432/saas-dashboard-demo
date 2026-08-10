import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/server";
import { PageHeader } from "@/components/shared/page-header";
import { UsersClient } from "@/components/users/users-client";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  await requirePermission("users:manage");
  return (
    <div className="space-y-6">
      <PageHeader
        title="Users & team"
        description="Manage team members and their roles. Changes are audited and take effect on next sign-in."
      />
      <UsersClient />
    </div>
  );
}
