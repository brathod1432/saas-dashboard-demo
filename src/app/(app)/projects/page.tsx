import { Suspense } from "react";
import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/server";
import { ProjectsClient } from "@/components/projects/projects-client";
import { TableSkeleton } from "@/components/shared/states";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  await requirePermission("projects:view");
  return (
    <Suspense fallback={<TableSkeleton columns={7} />}>
      <ProjectsClient />
    </Suspense>
  );
}
