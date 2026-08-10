import type { ListQuery, Paginated, Project } from "@/lib/types";
import { db } from "@/lib/mock/data";
import { generateId } from "@/lib/utils";
import { applyQuery } from "./query";

export const projectsRepository = {
  list(query: ListQuery = {}): Paginated<Project> {
    return applyQuery(db.projects, query, {
      searchFields: ["name", "status", "priority"],
      defaultSort: "name",
    });
  },

  getById(id: string): Project | undefined {
    return db.projects.find((p) => p.id === id);
  },

  byCustomer(customerId: string): Project[] {
    return db.projects.filter((p) => p.customerId === customerId);
  },

  create(input: Omit<Project, "id">): Project {
    const project: Project = { ...input, id: generateId("prj") };
    db.projects.unshift(project);
    return project;
  },

  update(id: string, patch: Partial<Project>): Project | undefined {
    const project = db.projects.find((p) => p.id === id);
    if (!project) return undefined;
    Object.assign(project, patch);
    return project;
  },

  all(): Project[] {
    return [...db.projects];
  },
};
