import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/server";
import { ROLE_DEFINITIONS } from "@/lib/rbac";
import { PageHeader } from "@/components/shared/page-header";
import { AccountForm } from "@/components/account/account-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <PageHeader title="Account" description="Manage your personal profile and role." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Your identity</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <Avatar className="h-16 w-16">
              <AvatarFallback
                style={{ backgroundColor: user.avatarColor, color: "#fff" }}
                className="text-lg"
              >
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-muted-foreground text-sm">{user.email}</p>
            </div>
            <Badge variant="default">{ROLE_DEFINITIONS[user.role].label}</Badge>
            <p className="text-muted-foreground text-xs">
              {ROLE_DEFINITIONS[user.role].description}
            </p>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <AccountForm user={user} />
        </div>
      </div>
    </div>
  );
}
