import type { Customer, ListQuery, Paginated } from "@/lib/types";
import { customersRepository } from "@/lib/api/repositories/customers";
import { projectsRepository } from "@/lib/api/repositories/projects";
import { invoicesRepository } from "@/lib/api/repositories/invoices";
import { recordAudit } from "@/lib/audit";
import { Errors } from "@/lib/api/errors";
import { CustomerCreateSchema, type CustomerCreateInput } from "@/lib/validation/schemas";
import { authorize, type Actor } from "./authorize";

export const customersService = {
  list(actor: Actor, query: ListQuery): Paginated<Customer> {
    authorize(actor, "customers:view");
    return customersRepository.list(query);
  },

  get(actor: Actor, id: string) {
    authorize(actor, "customers:view");
    const customer = customersRepository.getById(id);
    if (!customer) throw Errors.notFound("Customer not found");
    return {
      customer,
      projects: projectsRepository.byCustomer(id),
      invoices: invoicesRepository.byCustomer(id),
    };
  },

  create(actor: Actor, input: CustomerCreateInput): Customer {
    authorize(actor, "customers:create");
    const parsed = CustomerCreateSchema.safeParse(input);
    if (!parsed.success) throw Errors.badRequest(parsed.error.issues[0]?.message);
    const customer = customersRepository.create({
      ...parsed.data,
      healthScore: 75,
      ownerId: actor.id,
    });
    recordAudit({
      action: "customer.create",
      actorId: actor.id,
      actorName: actor.name,
      target: customer.id,
      ip: actor.ip,
    });
    return customer;
  },

  update(actor: Actor, id: string, patch: Partial<Customer>): Customer {
    authorize(actor, "customers:edit");
    const updated = customersRepository.update(id, patch);
    if (!updated) throw Errors.notFound("Customer not found");
    recordAudit({
      action: "customer.update",
      actorId: actor.id,
      actorName: actor.name,
      target: id,
      ip: actor.ip,
    });
    return updated;
  },

  remove(actor: Actor, id: string): { id: string } {
    authorize(actor, "customers:delete");
    const removed = customersRepository.remove(id);
    if (!removed) throw Errors.notFound("Customer not found");
    recordAudit({
      action: "customer.delete",
      actorId: actor.id,
      actorName: actor.name,
      target: id,
      ip: actor.ip,
    });
    return { id };
  },
};
