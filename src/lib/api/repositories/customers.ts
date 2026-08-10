import type { Customer, ListQuery, Paginated } from "@/lib/types";
import { db } from "@/lib/mock/data";
import { generateId } from "@/lib/utils";
import { applyQuery } from "./query";

export const customersRepository = {
  list(query: ListQuery = {}): Paginated<Customer> {
    return applyQuery(db.customers, query, {
      searchFields: ["name", "contactName", "email", "industry"],
      defaultSort: "name",
    });
  },

  getById(id: string): Customer | undefined {
    return db.customers.find((c) => c.id === id);
  },

  create(input: Omit<Customer, "id" | "createdAt">): Customer {
    const customer: Customer = {
      ...input,
      id: generateId("cus"),
      createdAt: new Date().toISOString(),
    };
    db.customers.unshift(customer);
    return customer;
  },

  update(id: string, patch: Partial<Customer>): Customer | undefined {
    const customer = db.customers.find((c) => c.id === id);
    if (!customer) return undefined;
    Object.assign(customer, patch);
    return customer;
  },

  remove(id: string): boolean {
    const index = db.customers.findIndex((c) => c.id === id);
    if (index === -1) return false;
    db.customers.splice(index, 1);
    return true;
  },

  all(): Customer[] {
    return [...db.customers];
  },
};
