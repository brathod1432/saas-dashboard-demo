"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Role, User } from "@/lib/types";
import { httpClient } from "@/lib/api/clients/http";

const KEY = ["users"] as const;

export function useUsers() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => httpClient.get<{ data: User[] }>("/users"),
    select: (result) => result.data,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      httpClient.patch<User>(`/users/${id}`, { role }),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success(`${user.name} is now ${user.role}`);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
