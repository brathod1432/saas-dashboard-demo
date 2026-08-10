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
import { ProjectCreateSchema, type ProjectCreateInput } from "@/lib/validation/schemas";
import { useCreateProject } from "@/hooks/use-projects";
import { useCustomers } from "@/hooks/use-customers";

const STATUSES = ["planning", "active", "on_hold", "completed", "cancelled"] as const;
const PRIORITIES = ["low", "medium", "high", "critical"] as const;

export function CreateProjectDialog({
  trigger,
  openSignal,
}: {
  trigger?: ReactNode;
  openSignal?: boolean;
}) {
  const [open, setOpen] = useState(Boolean(openSignal));
  const createProject = useCreateProject();
  const { data: customers } = useCustomers();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectCreateInput>({
    resolver: zodResolver(ProjectCreateSchema),
    defaultValues: { status: "planning", priority: "medium", budget: 0 },
  });

  async function onSubmit(values: ProjectCreateInput) {
    await createProject.mutateAsync(values);
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>Create a project for a customer.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field label="Project name" error={errors.name?.message} required>
            {(props) => <Input {...props} {...register("name")} />}
          </Field>

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
            <Field label="Priority" error={errors.priority?.message}>
              {({ id }) => (
                <Controller
                  control={control}
                  name="priority"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={id}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map((p) => (
                          <SelectItem key={p} value={p} className="capitalize">
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
            </Field>
            <Field label="Budget (USD)" error={errors.budget?.message} required>
              {(props) => (
                <Input
                  type="number"
                  min={0}
                  {...props}
                  {...register("budget", { valueAsNumber: true })}
                />
              )}
            </Field>
            <Field label="Due date" error={errors.dueDate?.message} required>
              {(props) => <Input type="date" {...props} {...register("dueDate")} />}
            </Field>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <SubmitButton loading={createProject.isPending}>Create project</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
