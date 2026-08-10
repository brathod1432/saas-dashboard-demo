"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Download, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/forms/field";
import { parseCsv } from "@/lib/csv";
import { CustomerCreateSchema, type CustomerCreateInput } from "@/lib/validation/schemas";
import { useImportCustomers } from "@/hooks/use-customers";

const TEMPLATE_HEADERS = [
  "name",
  "contactName",
  "email",
  "phone",
  "industry",
  "tier",
  "status",
  "mrr",
];
const TEMPLATE = `${TEMPLATE_HEADERS.join(",")}
Acme Inc,Jane Doe,jane@acme.com,+1 555 0100,Technology,business,active,5000
Globex,John Roe,john@globex.com,+1 555 0111,Finance,enterprise,prospect,12000`;

interface ParsedResult {
  valid: CustomerCreateInput[];
  errors: { line: number; message: string }[];
}

/** Map a lowercased header to our schema field so column order/casing is flexible. */
function normalizeRow(row: Record<string, string>): Record<string, unknown> {
  const lower: Record<string, string> = {};
  Object.entries(row).forEach(([k, v]) => (lower[k.toLowerCase()] = v));
  return {
    name: lower["name"],
    contactName: lower["contactname"] ?? lower["contact"] ?? lower["contact name"],
    email: lower["email"],
    phone: lower["phone"],
    industry: lower["industry"],
    tier: lower["tier"],
    status: lower["status"],
    mrr: Number(lower["mrr"] ?? 0),
  };
}

function validate(text: string): ParsedResult {
  const { rows } = parseCsv(text);
  const valid: CustomerCreateInput[] = [];
  const errors: ParsedResult["errors"] = [];
  rows.forEach((row, index) => {
    const parsed = CustomerCreateSchema.safeParse(normalizeRow(row));
    if (parsed.success) valid.push(parsed.data);
    else
      errors.push({
        line: index + 2, // +1 header, +1 for 1-based
        message: parsed.error.issues[0]?.message ?? "Invalid row",
      });
  });
  return { valid, errors };
}

function downloadTemplate() {
  const blob = new Blob([TEMPLATE], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "customers-template.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export function ImportCustomersDialog({ trigger }: { trigger?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const importCustomers = useImportCustomers();

  const result = useMemo(() => (text.trim() ? validate(text) : null), [text]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setText(await file.text());
  }

  async function onImport() {
    if (!result || result.valid.length === 0) return;
    await importCustomers.mutateAsync(result.valid);
    setText("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import customers from CSV</DialogTitle>
          <DialogDescription>
            Upload a .csv file or paste rows. Columns: {TEMPLATE_HEADERS.join(", ")}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <label className="cursor-pointer">
              <Upload className="h-4 w-4" />
              Choose file
              <input
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                onChange={handleFile}
              />
            </label>
          </Button>
          <Button variant="ghost" size="sm" onClick={downloadTemplate}>
            <Download className="h-4 w-4" />
            Download template
          </Button>
        </div>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="Paste CSV here, or choose a file above…"
          aria-label="CSV content"
          className="font-mono text-xs"
        />

        {result && (
          <div className="text-sm" aria-live="polite">
            <p>
              <span className="text-success font-medium">
                {result.valid.length} valid
              </span>
              {result.errors.length > 0 && (
                <>
                  {" · "}
                  <span className="text-destructive font-medium">
                    {result.errors.length} invalid
                  </span>
                </>
              )}
            </p>
            {result.errors.length > 0 && (
              <ul className="text-muted-foreground mt-2 max-h-28 overflow-y-auto text-xs">
                {result.errors.slice(0, 8).map((err) => (
                  <li key={err.line}>
                    Line {err.line}: {err.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <SubmitButton
            type="button"
            loading={importCustomers.isPending}
            disabled={!result || result.valid.length === 0}
            onClick={onImport}
          >
            Import {result?.valid.length ? `${result.valid.length} ` : ""}customers
          </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
