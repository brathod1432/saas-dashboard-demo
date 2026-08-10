import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/server";
import { PageHeader } from "@/components/shared/page-header";
import { ShowcaseClient } from "@/components/showcase/showcase-client";

export const metadata: Metadata = { title: "Showcase" };

export default async function ShowcasePage() {
  await requireUser();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Portfolio showcase"
        description="One starter, many products — see how Nexus Ops re-skins across verticals."
      />
      <ShowcaseClient />
    </div>
  );
}
