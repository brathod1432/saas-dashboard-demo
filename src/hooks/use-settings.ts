"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AppSettings } from "@/lib/types";
import { httpClient } from "@/lib/api/clients/http";

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AppSettings) => httpClient.patch<AppSettings>("/settings", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
