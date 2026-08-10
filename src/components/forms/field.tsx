"use client";

import { useId, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Accessible field wrapper: associates label, description, and error via ids and
 * wires `aria-invalid`/`aria-describedby` onto the input rendered by `children`.
 */
export function Field({
  label,
  error,
  description,
  required,
  children,
}: {
  label: string;
  error?: string;
  description?: string;
  required?: boolean;
  children: (props: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby"?: string;
  }) => ReactNode;
}) {
  const id = useId();
  const descId = description ? `${id}-desc` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [descId, errId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {description && (
        <p id={descId} className="text-muted-foreground text-xs">
          {description}
        </p>
      )}
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {error && (
        <p id={errId} role="alert" className="text-destructive text-xs">
          {error}
        </p>
      )}
    </div>
  );
}

/** Submit button with an integrated loading state. */
export function SubmitButton({
  loading,
  children,
  className,
  ...props
}: ButtonProps & { loading?: boolean }) {
  return (
    <Button type="submit" disabled={loading} className={cn(className)} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}
