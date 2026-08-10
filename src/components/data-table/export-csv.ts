import type { Column } from "./data-table";

/** Escape a value for safe CSV output (RFC 4180 + formula-injection guard). */
function escapeCsv(value: string): string {
  let v = value ?? "";
  // Neutralize spreadsheet formula injection.
  if (/^[=+\-@]/.test(v)) v = `'${v}`;
  if (/[",\n]/.test(v)) v = `"${v.replace(/"/g, '""')}"`;
  return v;
}

/**
 * Client-side CSV export. Uses each column's `exportValue` when provided, so the
 * exported data is plain text (not rendered JSX). Triggers a browser download.
 */
export function exportToCsv<T>(fileName: string, columns: Column<T>[], rows: T[]): void {
  const exportable = columns.filter((c) => c.exportValue);
  const header = exportable.map((c) => escapeCsv(c.header)).join(",");
  const body = rows
    .map((row) => exportable.map((c) => escapeCsv(String(c.exportValue!(row)))).join(","))
    .join("\n");
  const csv = `${header}\n${body}`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
