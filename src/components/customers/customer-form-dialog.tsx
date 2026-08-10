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
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/use-customers";
import type { Customer } from "@/lib/types";

const TIERS = ["enterprise", "business", "startup"] as const;
const STATUSES = ["active", "prospect", "on_hold", "churned"] as const;

/**
 * Create/edit customer dialog. Uncontrolled (with a trigger) for "New customer",
 * or controlled (open/onOpenChange) with a `customer` for row-level editing.
 */
export function CustomerFormDialog({
  mode = "create",
  customer,
  trigger,
  openSignal,
  open: controlledOpen,
  onOpenChange,
}: {
  mode?: "create" | "edit";
  customer?: Customer;
  trigger?: ReactNode;
  openSignal?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(Boolean(openSignal));
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (value: boolean) =>
    isControlled ? onOpenChange?.(value) : setInternalOpen(value);

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const isEdit = mode === "edit" && customer;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerCreateInput>({
    resolver: zodResolver(CustomerCreateSchema),
    defaultValues: customer
      ? {
          name: customer.name,
          contactName: customer.contactName,
          email: customer.email,
          phone: customer.phone,
          industry: customer.industry,
          tier: customer.tier,
          status: customer.status === "churned" ? "churned" : customer.status,
          mrr: customer.mrr,
        }
      : { tier: "business", status: "prospect", mrr: 0 },
  });

  async function onSubmit(values: CustomerCreateInput) {
    if (isEdit) {
      await updateCustomer.mutateAsync({ id: customer!.id, patch: values });
    } else {
      await createCustomer.mutateAsync(values);
      reset();
    }
    setOpen(false);
  }

  const pending = createCustomer.isPending || updateCustomer.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit customer" : "New customer"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this customer's details."
              : "Add a customer to your workspace."}
          </DialogDescription>
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
            <SubmitButton loading={pending}>
              {isEdit ? "Save changes" : "Create customer"}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
