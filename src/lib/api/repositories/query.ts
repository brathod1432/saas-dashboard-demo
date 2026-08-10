import type { ListQuery, Paginated } from "@/lib/types";

/**
 * Generic in-memory query engine used by repositories: search across chosen
 * fields, filter by status, sort, and paginate. Mirrors what a real backend
 * would do in SQL so the service/hook contract does not change on migration.
 */
export function applyQuery<T extends object>(
  rows: T[],
  query: ListQuery,
  options: { searchFields: (keyof T)[]; defaultSort?: keyof T }
): Paginated<T> {
  const { search, status, sortBy, sortDir = "asc" } = query;
  const get = (row: T, key: keyof T): unknown =>
    (row as Record<string, unknown>)[key as string];
  let result = [...rows];

  if (search) {
    const needle = search.toLowerCase();
    result = result.filter((row) =>
      options.searchFields.some((field) =>
        String(get(row, field) ?? "")
          .toLowerCase()
          .includes(needle)
      )
    );
  }

  if (status && status !== "all") {
    result = result.filter((row) => String(get(row, "status" as keyof T)) === status);
  }

  const sortKey = (sortBy as keyof T) ?? options.defaultSort;
  if (sortKey) {
    result.sort((a, b) => {
      const av = get(a, sortKey);
      const bv = get(b, sortKey);
      let cmp = 0;
      if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
      else cmp = String(av).localeCompare(String(bv));
      return sortDir === "desc" ? -cmp : cmp;
    });
  }

  const total = result.length;
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.max(1, query.pageSize ?? 10);
  const start = (page - 1) * pageSize;
  const data = result.slice(start, start + pageSize);

  return { data, total, page, pageSize };
}
