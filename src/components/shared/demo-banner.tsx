"use client";

import { useState } from "react";
import { Info, X } from "lucide-react";

/** Non-intrusive banner clarifying this is a demo with mock auth/data. */
export function DemoBanner() {
  const [open, setOpen] = useState(true);
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "false" || !open) return null;
  return (
    <div
      role="status"
      className="bg-info/10 text-info flex items-center gap-2 border-b px-4 py-2 text-xs lg:px-8"
    >
      <Info className="h-3.5 w-3.5 shrink-0" />
      <p className="flex-1">
        Demo mode — data is seeded in memory and authentication is simulated. Do not enter
        real credentials.
      </p>
      <button
        onClick={() => setOpen(false)}
        aria-label="Dismiss demo notice"
        className="hover:opacity-70"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
