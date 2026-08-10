import { Suspense } from "react";
import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/server";
import { InvoicesClient } from "@/components/invoices/invoices-client";
import { TableSkeleton } from "@/components/shared/states";

export const metadata: Metadata = { title: "Invoices" };

export default async function InvoicesPage() {
  await requirePermission("invoices:view");
  return (
    <Suspense fallback={<TableSkeleton columns={6} />}>
      <InvoicesClient />
    </Suspense>
  );
}
