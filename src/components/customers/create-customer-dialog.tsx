"use client";

import { useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, SubmitButton } from "@/components/forms/field";
import { CustomerCreateSchema, type CustomerCreateInput } from "@/lib/validation/schemas";
import { useCreateCustomer } from "@/hooks/use-customers";

const TIERS = ["enterprise", "business", "startup"] as const;
const STATUSES = ["active", "prospect", "on_hold", "churned"] as const;

export function CreateCustomerDialog({
  trigger,
  openSignal,
}: {
  trigger?: ReactNode;
  openSignal?: boolean;
}) {
  const [open, setOpen] = useState(Boolean(openSignal));
  const createCustomer = useCreateCustomer();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerCreateInput>({
    resolver: zodResolver(CustomerCreateSchema),
    defaultValues: { tier: "business", status: "prospect", mrr: 0 },
  });

  async function onSubmit(values: CustomerCreateInput) {
    await createCustomer.mutateAsync(values);
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New customer</DialogTitle>
          <DialogDescription>Add a customer to your workspace.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company" error={errors.name?.message} required>
              {(props) => <Input {...props} {...register("name")} />}
            </Field>
            <Field label="Industry" error={errors.industry?.message} required>
              {(props) => <Input {...props} {...register("industry")} />}
            </Field>
            <Field label="Contact name" error={errors.contactName?.message} required>
              {(props) => <Input {...props} {...register("contactName")} />}
            </Field>
            <Field label="Email" error={errors.email?.message} required>
              {(props) => <Input type="email" {...props} {...register("email")} />}
            </Field>
            <Field label="Phone" error={errors.phone?.message} required>
              {(props) => <Input {...props} {...register("phone")} />}
            </Field>
            <Field label="MRR (USD)" error={errors.mrr?.message} required>
              {(props) => (
                <Input
                  type="number"
                  min={0}
                  {...props}
                  {...register("mrr", { valueAsNumber: true })}
                />
              )}
            </Field>
            <Field label="Tier" error={errors.tier?.message}>
              {({ id }) => (
                <Controller
                  control={control}
                  name="tier"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={id}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIERS.map((t) => (
                          <SelectItem key={t} value={t} className="capitalize">
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
            </Field>
            <Field label="Status" error={errors.status?.message}>
              {({ id }) => (
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={id}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {s.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
            </Field>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <SubmitButton loading={createCustomer.isPending}>
              Create customer
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
