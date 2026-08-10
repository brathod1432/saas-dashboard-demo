"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/states";
import { cn } from "@/lib/utils";
import { exportToCsv } from "./export-csv";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  exportValue?: (row: T) => string;
  sortable?: boolean;
  hideable?: boolean;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string;
  searchableText?: (row: T) => string;
  searchPlaceholder?: string;
  statusOptions?: { label: string; value: string }[];
  statusOf?: (row: T) => string;
  bulkActions?: (selected: T[], clear: () => void) => ReactNode;
  onRowClick?: (row: T) => void;
  exportFileName?: string;
  pageSize?: number;
  emptyMessage?: string;
}

type SortDir = "asc" | "desc";

export function DataTable<T>({
  data,
  columns,
  getRowId,
  searchableText,
  searchPlaceholder = "Search…",
  statusOptions,
  statusOf,
  bulkActions,
  onRowClick,
  exportFileName = "export",
  pageSize: initialPageSize = 10,
  emptyMessage = "No matching records.",
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const visibleColumns = columns.filter((c) => !hidden.has(c.key));

  const filtered = useMemo(() => {
    let rows = [...data];
    if (search && searchableText) {
      const needle = search.toLowerCase();
      rows = rows.filter((row) => searchableText(row).toLowerCase().includes(needle));
    }
    if (status !== "all" && statusOf) {
      rows = rows.filter((row) => statusOf(row) === status);
    }
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col?.sortValue) {
        rows.sort((a, b) => {
          const av = col.sortValue!(a);
          const bv = col.sortValue!(b);
          let cmp = 0;
          if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
          else cmp = String(av).localeCompare(String(bv));
          return sortDir === "desc" ? -cmp : cmp;
        });
      }
    }
    return rows;
  }, [data, search, status, statusOf, sortKey, sortDir, columns, searchableText]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const selectedRows = filtered.filter((r) => selected.has(getRowId(r)));
  const allPageSelected =
    pageRows.length > 0 && pageRows.every((r) => selected.has(getRowId(r)));

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function togglePage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) pageRows.forEach((r) => next.delete(getRowId(r)));
      else pageRows.forEach((r) => next.add(getRowId(r)));
      return next;
    });
  }

  const clearSelection = () => setSelected(new Set());

  function handleExport() {
    const rows = selectedRows.length > 0 ? selectedRows : filtered;
    exportToCsv(exportFileName, visibleColumns, rows);
  }

  const hasSelection = selectedRows.length > 0;

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative w-full sm:max-w-xs">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              aria-label="Search table"
              className="pl-9"
            />
          </div>
          {statusOptions && (
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40" aria-label="Filter by status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns
                .filter((c) => c.hideable !== false)
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.key}
                    checked={!hidden.has(col.key)}
                    onCheckedChange={(checked) =>
                      setHidden((prev) => {
                        const next = new Set(prev);
                        if (checked) next.delete(col.key);
                        else next.add(col.key);
                        return next;
                      })
                    }
                  >
                    {col.header}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Bulk action bar */}
      {hasSelection && bulkActions && (
        <div className="bg-primary/5 border-primary/20 flex items-center justify-between rounded-md border px-3 py-2 text-sm">
          <span>{selectedRows.length} selected</span>
          <div className="flex items-center gap-2">
            {bulkActions(selectedRows, clearSelection)}
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {bulkActions && (
                <TableHead className="w-10">
                  <Checkbox
                    checked={allPageSelected}
                    onCheckedChange={togglePage}
                    aria-label="Select all rows on this page"
                  />
                </TableHead>
              )}
              {visibleColumns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <TableHead
                    key={col.key}
                    className={col.className}
                    aria-sort={
                      col.sortable
                        ? isSorted
                          ? sortDir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                        : undefined
                    }
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className="hover:text-foreground inline-flex items-center gap-1 uppercase"
                      >
                        {col.header}
                        {isSorted ? (
                          sortDir === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + (bulkActions ? 1 : 0)}
                  className="p-0"
                >
                  <EmptyState
                    title="No results"
                    description={emptyMessage}
                    className="border-0"
                  />
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((row) => {
                const id = getRowId(row);
                const isSelected = selected.has(id);
                return (
                  <TableRow
                    key={id}
                    data-state={isSelected ? "selected" : undefined}
                    className={cn(onRowClick && "cursor-pointer")}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {bulkActions && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleRow(id)}
                          aria-label={`Select row ${id}`}
                        />
                      </TableCell>
                    )}
                    {visibleColumns.map((col) => (
                      <TableCell key={col.key} className={col.className}>
                        {col.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-muted-foreground text-sm">
          {total === 0
            ? "0 results"
            : `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(
                currentPage * pageSize,
                total
              )} of ${total}`}
        </p>
        <div className="flex items-center gap-2">
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-28" aria-label="Rows per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm tabular-nums">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
