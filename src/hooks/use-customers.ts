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
