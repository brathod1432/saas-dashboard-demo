import type { Invoice, ListQuery, Paginated } from "@/lib/types";
import { invoicesRepository } from "@/lib/api/repositories/invoices";
import { recordAudit } from "@/lib/audit";
import { Errors } from "@/lib/api/errors";
import { InvoiceCreateSchema, type InvoiceCreateInput } from "@/lib/validation/schemas";
import { authorize, type Actor } from "./authorize";

export const invoicesService = {
  list(actor: Actor, query: ListQuery): Paginated<Invoice> {
    authorize(actor, "invoices:view");
    return invoicesRepository.list(query);
  },

  create(actor: Actor, input: InvoiceCreateInput): Invoice {
    authorize(actor, "invoices:create");
    const parsed = InvoiceCreateSchema.safeParse(input);
    if (!parsed.success) throw Errors.badRequest(parsed.error.issues[0]?.message);
    const invoice = invoicesRepository.create({
      ...parsed.data,
      issuedAt: new Date().toISOString(),
      paidAt: parsed.data.status === "paid" ? new Date().toISOString() : null,
    });
    recordAudit({
      action: "invoice.create",
      actorId: actor.id,
      actorName: actor.name,
      target: invoice.id,
      ip: actor.ip,
    });
    return invoice;
  },

  void(actor: Actor, id: string): Invoice {
    authorize(actor, "invoices:void");
    const updated = invoicesRepository.update(id, { status: "void" });
    if (!updated) throw Errors.notFound("Invoice not found");
    recordAudit({
      action: "invoice.create",
      actorId: actor.id,
      actorName: actor.name,
      target: `void:${id}`,
      ip: actor.ip,
      severity: "warning",
    });
    return updated;
  },
};
