import { CardsSkeleton, TableSkeleton } from "@/components/shared/states";
import { Skeleton } from "@/components/ui/skeleton";

/** Route-level loading UI for the authenticated app while a page streams in. */
export default function AppLoading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <CardsSkeleton />
      <TableSkeleton rows={6} columns={6} />
    </div>
  );
}
