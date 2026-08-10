"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { LoginSchema, type LoginInput } from "@/lib/validation/schemas";
import { httpClient } from "@/lib/api/clients/http";
import { Field, SubmitButton } from "@/components/forms/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const ROLES: { label: string; email: string }[] = [
  { label: "Admin", email: "admin@nexusops.demo" },
  { label: "Manager", email: "manager@nexusops.demo" },
  { label: "User", email: "user@nexusops.demo" },
  { label: "Viewer", email: "viewer@nexusops.demo" },
];

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = params.get("next") ?? "/dashboard";
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  async function onSubmit(values: LoginInput) {
    setSubmitting(true);
    try {
      await httpClient.post("/auth/login", values);
      toast.success("Welcome back");
      router.push(nextPath);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function quickLogin(email: string) {
    setValue("email", email);
    setValue("password", "password");
    await onSubmit({ email, password: "password", remember: true });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-muted-foreground text-sm">
          Enter your credentials to access the dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Email" error={errors.email?.message} required>
          {(props) => (
            <Input
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              {...props}
              {...register("email")}
            />
          )}
        </Field>

        <Field label="Password" error={errors.password?.message} required>
          {(props) => (
            <Input
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...props}
              {...register("password")}
            />
          )}
        </Field>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox id="remember" defaultChecked {...register("remember")} />
            <Label htmlFor="remember" className="text-sm font-normal">
              Remember me
            </Label>
          </div>
          <Link href="/forgot-password" className="text-primary text-sm hover:underline">
            Forgot password?
          </Link>
        </div>

        <SubmitButton loading={submitting} className="w-full">
          Sign in
        </SubmitButton>
      </form>

      <div className="space-y-2">
        <p className="text-muted-foreground text-center text-xs">
          Quick demo sign-in (password: <code>password</code>)
        </p>
        <div className="grid grid-cols-2 gap-2">
          {ROLES.map((role) => (
            <Button
              key={role.email}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => quickLogin(role.email)}
              disabled={submitting}
            >
              {role.label}
            </Button>
          ))}
        </div>
      </div>

      <p className="text-muted-foreground text-center text-sm">
        No account?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
