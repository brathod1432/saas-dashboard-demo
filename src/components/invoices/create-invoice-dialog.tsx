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
import { InvoiceCreateSchema, type InvoiceCreateInput } from "@/lib/validation/schemas";
import { useCreateInvoice } from "@/hooks/use-invoices";
import { useCustomers } from "@/hooks/use-customers";

const STATUSES = ["draft", "sent", "paid", "overdue", "void"] as const;

export function CreateInvoiceDialog({
  trigger,
  openSignal,
}: {
  trigger?: ReactNode;
  openSignal?: boolean;
}) {
  const [open, setOpen] = useState(Boolean(openSignal));
  const createInvoice = useCreateInvoice();
  const { data: customers } = useCustomers();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InvoiceCreateInput>({
    resolver: zodResolver(InvoiceCreateSchema),
    defaultValues: { status: "draft", amount: 0 },
  });

  async function onSubmit(values: InvoiceCreateInput) {
    await createInvoice.mutateAsync(values);
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New invoice</DialogTitle>
          <DialogDescription>Issue an invoice to a customer.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field label="Customer" error={errors.customerId?.message} required>
            {({ id }) => (
              <Controller
                control={control}
                name="customerId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id={id}>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {(customers ?? []).map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Amount (USD)" error={errors.amount?.message} required>
              {(props) => (
                <Input
                  type="number"
                  min={0}
                  {...props}
                  {...register("amount", { valueAsNumber: true })}
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
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
            </Field>
          </div>

          <Field label="Due date" error={errors.dueAt?.message} required>
            {(props) => <Input type="date" {...props} {...register("dueAt")} />}
          </Field>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <SubmitButton loading={createInvoice.isPending}>Create invoice</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
