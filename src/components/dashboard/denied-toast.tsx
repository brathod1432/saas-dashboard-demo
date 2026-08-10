"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

/** Surfaces an access-denied notice after a server-side permission redirect. */
export function DeniedToast() {
  const params = useSearchParams();
  useEffect(() => {
    if (params.get("denied")) {
      toast.error("You don't have permission to access that page.");
    }
  }, [params]);
  return null;
}
