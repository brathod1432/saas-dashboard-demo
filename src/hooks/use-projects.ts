"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Paginated, Project } from "@/lib/types";
import { httpClient } from "@/lib/api/clients/http";
import type { ProjectCreateInput } from "@/lib/validation/schemas";

const KEY = ["projects"] as const;

export function useProjects() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => httpClient.get<Paginated<Project>>("/projects?pageSize=1000"),
    select: (result) => result.data,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProjectCreateInput) =>
      httpClient.post<Project>("/projects", input),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success(`Project "${project.name}" created`);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Project> }) =>
      httpClient.patch<Project>(`/projects/${id}`, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success("Project updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => httpClient.del<{ id: string }>(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success("Project deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
