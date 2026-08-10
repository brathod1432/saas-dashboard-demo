"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { User } from "@/lib/types";
import { httpClient } from "@/lib/api/clients/http";
import type { ProfileUpdateInput } from "@/lib/validation/schemas";

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (input: ProfileUpdateInput) => httpClient.patch<User>("/account", input),
    onSuccess: () => toast.success("Profile updated"),
    onError: (error: Error) => toast.error(error.message),
  });
}
