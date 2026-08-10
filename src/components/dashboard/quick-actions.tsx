"use client";

import { useRouter } from "next/navigation";
import { FilePlus2, FolderPlus, UserPlus, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Can } from "@/components/auth/can";

/** Permission-gated shortcuts. Hidden entirely when the user lacks the right. */
export function QuickActions() {
  const router = useRouter();
  return (
    <div className="grid grid-cols-2 gap-2">
      <Can permission="customers:create">
        <Button
          variant="outline"
          className="justify-start"
          onClick={() => router.push("/customers?new=1")}
        >
          <UserPlus className="h-4 w-4" />
          New customer
        </Button>
      </Can>
      <Can permission="projects:create">
        <Button
          variant="outline"
          className="justify-start"
          onClick={() => router.push("/projects?new=1")}
        >
          <FolderPlus className="h-4 w-4" />
          New project
        </Button>
      </Can>
      <Can permission="invoices:create">
        <Button
          variant="outline"
          className="justify-start"
          onClick={() => router.push("/invoices?new=1")}
        >
          <FilePlus2 className="h-4 w-4" />
          New invoice
        </Button>
      </Can>
      <Can permission="reports:view">
        <Button
          variant="outline"
          className="justify-start"
          onClick={() => router.push("/reports")}
        >
          <BarChart3 className="h-4 w-4" />
          View reports
        </Button>
      </Can>
    </div>
  );
}
