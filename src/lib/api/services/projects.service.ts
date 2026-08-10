import type { ListQuery, Paginated, Project } from "@/lib/types";
import { projectsRepository } from "@/lib/api/repositories/projects";
import { customersRepository } from "@/lib/api/repositories/customers";
import { recordAudit } from "@/lib/audit";
import { Errors } from "@/lib/api/errors";
import { ProjectCreateSchema, type ProjectCreateInput } from "@/lib/validation/schemas";
import { authorize, type Actor } from "./authorize";

export const projectsService = {
  list(actor: Actor, query: ListQuery): Paginated<Project> {
    authorize(actor, "projects:view");
    return projectsRepository.list(query);
  },

  get(actor: Actor, id: string) {
    authorize(actor, "projects:view");
    const project = projectsRepository.getById(id);
    if (!project) throw Errors.notFound("Project not found");
    return { project, customer: customersRepository.getById(project.customerId) };
  },

  create(actor: Actor, input: ProjectCreateInput): Project {
    authorize(actor, "projects:create");
    const parsed = ProjectCreateSchema.safeParse(input);
    if (!parsed.success) throw Errors.badRequest(parsed.error.issues[0]?.message);
    const project = projectsRepository.create({
      ...parsed.data,
      progress: 0,
      spent: 0,
      startDate: new Date().toISOString(),
      leadId: actor.id,
      tags: [],
    });
    recordAudit({
      action: "project.create",
      actorId: actor.id,
      actorName: actor.name,
      target: project.id,
      ip: actor.ip,
    });
    return project;
  },

  update(actor: Actor, id: string, patch: Partial<Project>): Project {
    authorize(actor, "projects:edit");
    const updated = projectsRepository.update(id, patch);
    if (!updated) throw Errors.notFound("Project not found");
    recordAudit({
      action: "project.update",
      actorId: actor.id,
      actorName: actor.name,
      target: id,
      ip: actor.ip,
    });
    return updated;
  },

  remove(actor: Actor, id: string): { id: string } {
    authorize(actor, "projects:delete");
    const removed = projectsRepository.remove(id);
    if (!removed) throw Errors.notFound("Project not found");
    recordAudit({
      action: "project.delete",
      actorId: actor.id,
      actorName: actor.name,
      target: id,
      ip: actor.ip,
    });
    return { id };
  },
};
