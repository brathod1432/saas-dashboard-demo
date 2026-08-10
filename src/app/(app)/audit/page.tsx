import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/server";
import { PageHeader } from "@/components/shared/page-header";
import { AuditClient } from "@/components/audit/audit-client";

export const metadata: Metadata = { title: "Audit log" };

export default async function AuditPage() {
  await requirePermission("audit:view");
  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit log"
        description="Every security-relevant event — search, filter by severity, and export to CSV."
      />
      <AuditClient />
    </div>
  );
}
