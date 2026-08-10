import type { Invoice, ListQuery, Paginated } from "@/lib/types";
import { db } from "@/lib/mock/data";
import { persist } from "@/lib/mock/persistence";
import { generateId } from "@/lib/utils";
import { applyQuery } from "./query";

export const invoicesRepository = {
  list(query: ListQuery = {}): Paginated<Invoice> {
    return applyQuery(db.invoices, query, {
      searchFields: ["number", "status"],
      defaultSort: "issuedAt",
    });
  },

  getById(id: string): Invoice | undefined {
    return db.invoices.find((i) => i.id === id);
  },

  byCustomer(customerId: string): Invoice[] {
    return db.invoices.filter((i) => i.customerId === customerId);
  },

  create(input: Omit<Invoice, "id" | "number">): Invoice {
    const number = `INV-2026-${String(db.invoices.length + 1).padStart(4, "0")}`;
    const invoice: Invoice = { ...input, id: generateId("inv"), number };
    db.invoices.unshift(invoice);
    persist();
    return invoice;
  },

  update(id: string, patch: Partial<Invoice>): Invoice | undefined {
    const invoice = db.invoices.find((i) => i.id === id);
    if (!invoice) return undefined;
    Object.assign(invoice, patch);
    persist();
    return invoice;
  },

  all(): Invoice[] {
    return [...db.invoices];
  },
};
