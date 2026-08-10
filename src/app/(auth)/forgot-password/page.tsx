"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { ForgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validation/schemas";
import { Field, SubmitButton } from "@/components/forms/field";
import { Input } from "@/components/ui/input";
import { delay } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(ForgotPasswordSchema) });

  async function onSubmit() {
    setSubmitting(true);
    await delay(600);
    setSubmitting(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <div className="bg-success/10 text-success mx-auto flex h-12 w-12 items-center justify-center rounded-full">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-semibold">Check your inbox</h1>
        <p className="text-muted-foreground text-sm">
          If an account exists for that email, we&apos;ve sent password reset
          instructions.
        </p>
        <Link href="/login" className="text-primary inline-block text-sm hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
        <p className="text-muted-foreground text-sm">
          Enter your email and we&apos;ll send you a reset link.
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
        <SubmitButton loading={submitting} className="w-full">
          Send reset link
        </SubmitButton>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        Remembered it?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
