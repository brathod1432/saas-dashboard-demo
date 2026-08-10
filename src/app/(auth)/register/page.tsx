"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { RegisterSchema, type RegisterInput } from "@/lib/validation/schemas";
import { Field, SubmitButton } from "@/components/forms/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { delay } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(RegisterSchema) });

  async function onSubmit() {
    setSubmitting(true);
    // Registration is simulated in the demo — no account is persisted.
    await delay(700);
    setSubmitting(false);
    toast.success("Account created — please sign in");
    router.push("/login");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="text-muted-foreground text-sm">
          Start your 14-day trial. No credit card required.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Full name" error={errors.name?.message} required>
          {(props) => (
            <Input
              autoComplete="name"
              placeholder="Jane Doe"
              {...props}
              {...register("name")}
            />
          )}
        </Field>
        <Field label="Work email" error={errors.email?.message} required>
          {(props) => (
            <Input
              type="email"
              autoComplete="email"
              placeholder="jane@company.com"
              {...props}
              {...register("email")}
            />
          )}
        </Field>
        <Field label="Company" error={errors.company?.message} required>
          {(props) => (
            <Input placeholder="Acme Inc." {...props} {...register("company")} />
          )}
        </Field>
        <Field
          label="Password"
          error={errors.password?.message}
          description="At least 8 characters, one uppercase letter and one number."
          required
        >
          {(props) => (
            <Input
              type="password"
              autoComplete="new-password"
              {...props}
              {...register("password")}
            />
          )}
        </Field>
        <Field label="Confirm password" error={errors.confirmPassword?.message} required>
          {(props) => (
            <Input
              type="password"
              autoComplete="new-password"
              {...props}
              {...register("confirmPassword")}
            />
          )}
        </Field>

        <div className="space-y-1.5">
          <div className="flex items-start gap-2">
            <Controller
              control={control}
              name="acceptTerms"
              render={({ field }) => (
                <Checkbox
                  id="terms"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
              )}
            />
            <Label htmlFor="terms" className="text-sm leading-snug font-normal">
              I agree to the Terms of Service and Privacy Policy.
            </Label>
          </div>
          {errors.acceptTerms && (
            <p role="alert" className="text-destructive text-xs">
              {errors.acceptTerms.message}
            </p>
          )}
        </div>

        <SubmitButton loading={submitting} className="w-full">
          Create account
        </SubmitButton>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
