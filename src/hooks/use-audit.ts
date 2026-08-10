"use client";

import { useQuery } from "@tanstack/react-query";
import type { AuditLogEntry } from "@/lib/types";
import { httpClient } from "@/lib/api/clients/http";

export function useAudit() {
  return useQuery({
    queryKey: ["audit"],
    queryFn: () => httpClient.get<{ data: AuditLogEntry[] }>("/audit"),
    select: (result) => result.data,
  });
}
