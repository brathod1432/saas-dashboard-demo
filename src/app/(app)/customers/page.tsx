import { Suspense } from "react";
import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/server";
import { CustomersClient } from "@/components/customers/customers-client";
import { TableSkeleton } from "@/components/shared/states";

export const metadata: Metadata = { title: "Customers" };

export default async function CustomersPage() {
  await requirePermission("customers:view");
  return (
    <Suspense fallback={<TableSkeleton columns={7} />}>
      <CustomersClient />
    </Suspense>
  );
}
