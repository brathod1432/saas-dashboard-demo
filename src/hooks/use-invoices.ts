"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Invoice, Paginated } from "@/lib/types";
import { httpClient } from "@/lib/api/clients/http";
import type { InvoiceCreateInput } from "@/lib/validation/schemas";

const KEY = ["invoices"] as const;

export function useInvoices() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => httpClient.get<Paginated<Invoice>>("/invoices?pageSize=1000"),
    select: (result) => result.data,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: InvoiceCreateInput) =>
      httpClient.post<Invoice>("/invoices", input),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success(`Invoice ${invoice.number} created`);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
