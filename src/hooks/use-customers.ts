"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Customer, Paginated } from "@/lib/types";
import { httpClient } from "@/lib/api/clients/http";
import type { CustomerCreateInput } from "@/lib/validation/schemas";

const KEY = ["customers"] as const;

/** Fetch the full customer list (client-side table handles sort/filter/page). */
export function useCustomers() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => httpClient.get<Paginated<Customer>>("/customers?pageSize=1000"),
    select: (result) => result.data,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CustomerCreateInput) =>
      httpClient.post<Customer>("/customers", input),
    onSuccess: (customer) => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success(`Customer "${customer.name}" created`);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Customer> }) =>
      httpClient.patch<Customer>(`/customers/${id}`, patch),
    onSuccess: (customer) => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success(`Customer "${customer.name}" updated`);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => httpClient.del<{ id: string }>(`/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success("Customer deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

/** Bulk delete/update — one request per row, a single toast, one invalidation. */
export function useBulkDeleteCustomers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      Promise.all(ids.map((id) => httpClient.del<{ id: string }>(`/customers/${id}`))),
    onSuccess: (_res, ids) => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success(`Deleted ${ids.length} customer${ids.length === 1 ? "" : "s"}`);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useBulkUpdateCustomers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, patch }: { ids: string[]; patch: Partial<Customer> }) =>
      Promise.all(ids.map((id) => httpClient.patch<Customer>(`/customers/${id}`, patch))),
    onSuccess: (_res, { ids }) => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success(`Updated ${ids.length} customer${ids.length === 1 ? "" : "s"}`);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

/** Import many customers (validated client-side before POSTing each row). */
export function useImportCustomers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inputs: CustomerCreateInput[]) =>
      Promise.all(inputs.map((input) => httpClient.post<Customer>("/customers", input))),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success(`Imported ${res.length} customer${res.length === 1 ? "" : "s"}`);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
