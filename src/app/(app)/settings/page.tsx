import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/server";
import { listAudit } from "@/lib/audit";
import { settingsRepository } from "@/lib/api/repositories/settings";
import { hasPermission } from "@/lib/rbac";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsClient } from "@/components/settings/settings-client";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requirePermission("settings:view");
  const audit = listAudit(25);
  const settings = settingsRepository.get();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Organization, security, access control, and audit."
      />
      <SettingsClient
        audit={audit}
        settings={settings}
        canEdit={hasPermission(user.role, "settings:edit")}
      />
    </div>
  );
}
