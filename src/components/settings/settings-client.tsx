"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { AuditLogEntry } from "@/lib/types";
import { SettingsSchema, type SettingsInput } from "@/lib/validation/schemas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Field, SubmitButton } from "@/components/forms/field";
import { PermissionMatrix } from "@/components/rbac/permission-matrix";
import { AuditTable } from "@/components/audit/audit-table";
import { Can } from "@/components/auth/can";
import { delay } from "@/lib/utils";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "Europe/London",
  "Asia/Tokyo",
  "Asia/Kolkata",
];

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  id,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="space-y-0.5">
        <Label htmlFor={id}>{label}</Label>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function SettingsClient({ audit }: { audit: AuditLogEntry[] }) {
  const [saving, setSaving] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<SettingsInput>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      organizationName: "Nexus Ops",
      timezone: "UTC",
      weeklyDigest: true,
      securityAlerts: true,
      twoFactor: false,
    },
  });

  async function onSubmit() {
    setSaving(true);
    await delay(600);
    setSaving(false);
    toast.success("Settings saved");
  }

  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="access">Access control</TabsTrigger>
        <TabsTrigger value="audit">Audit log</TabsTrigger>
      </TabsList>

      <form onSubmit={handleSubmit(onSubmit)}>
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
              <CardDescription>General workspace configuration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Organization name" error={errors.organizationName?.message}>
                {(props) => <Input {...props} {...register("organizationName")} />}
              </Field>
              <Field label="Timezone" error={errors.timezone?.message}>
                {({ id }) => (
                  <Controller
                    control={control}
                    name="timezone"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id={id} className="sm:w-72">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIMEZONES.map((tz) => (
                            <SelectItem key={tz} value={tz}>
                              {tz}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
              </Field>
              <Controller
                control={control}
                name="weeklyDigest"
                render={({ field }) => (
                  <ToggleRow
                    id="weeklyDigest"
                    label="Weekly digest email"
                    description="Receive a Monday summary of activity and KPIs."
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Protect your organization and account.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              <Controller
                control={control}
                name="securityAlerts"
                render={({ field }) => (
                  <ToggleRow
                    id="securityAlerts"
                    label="Security alerts"
                    description="Email me about suspicious sign-ins and access changes."
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="twoFactor"
                render={({ field }) => (
                  <ToggleRow
                    id="twoFactor"
                    label="Two-factor authentication"
                    description="Require a second factor at sign-in (demo toggle)."
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <div className="mt-4">
          <SubmitButton loading={saving} disabled={!isDirty && !saving}>
            Save changes
          </SubmitButton>
        </div>
      </form>

      <TabsContent value="access" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Role-based access control</CardTitle>
            <CardDescription>
              Effective permissions per role. Rendered from the single RBAC source of
              truth.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PermissionMatrix />
            <Can
              permission="users:manage"
              fallback={
                <p className="text-muted-foreground mt-4 text-xs">
                  Only admins can modify role assignments.
                </p>
              }
            >
              <p className="text-success mt-4 text-xs">
                You can manage user role assignments.
              </p>
            </Can>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="audit" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Audit log</CardTitle>
            <CardDescription>
              Security-relevant events across the workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuditTable entries={audit} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
