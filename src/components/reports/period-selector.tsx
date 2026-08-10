"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OPTIONS = [
  { value: "3", label: "Last 3 months" },
  { value: "6", label: "Last 6 months" },
  { value: "12", label: "Last 12 months" },
];

/** Updates the `?period` query param; the server page re-slices the series. */
export function PeriodSelector() {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("period") ?? "12";

  return (
    <Select
      value={current}
      onValueChange={(value) => {
        const next = new URLSearchParams(params.toString());
        next.set("period", value);
        router.push(`/reports?${next.toString()}`);
      }}
    >
      <SelectTrigger className="w-44" aria-label="Reporting period">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
