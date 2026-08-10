import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/server";
import { listAudit } from "@/lib/audit";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsClient } from "@/components/settings/settings-client";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requirePermission("settings:view");
  const audit = listAudit(25);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Organization, security, access control, and audit."
      />
      <SettingsClient audit={audit} />
    </div>
  );
}
