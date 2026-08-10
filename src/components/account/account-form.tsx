"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { User } from "@/lib/types";
import { ProfileUpdateSchema, type ProfileUpdateInput } from "@/lib/validation/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, SubmitButton } from "@/components/forms/field";
import { delay } from "@/lib/utils";

export function AccountForm({ user }: { user: User }) {
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(ProfileUpdateSchema),
    defaultValues: {
      name: user.name,
      title: user.title,
      department: user.department,
    },
  });

  async function onSubmit() {
    setSaving(true);
    await delay(600);
    setSaving(false);
    toast.success("Profile updated");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-4" noValidate>
          <Field label="Full name" error={errors.name?.message} required>
            {(props) => <Input {...props} {...register("name")} />}
          </Field>
          <Field label="Email">
            {(props) => <Input {...props} value={user.email} disabled readOnly />}
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Job title" error={errors.title?.message} required>
              {(props) => <Input {...props} {...register("title")} />}
            </Field>
            <Field label="Department" error={errors.department?.message} required>
              {(props) => <Input {...props} {...register("department")} />}
            </Field>
          </div>
          <SubmitButton loading={saving} disabled={!isDirty && !saving}>
            Save profile
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
