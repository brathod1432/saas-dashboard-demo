import type { ListQuery, Paginated, Project } from "@/lib/types";
import { db } from "@/lib/mock/data";
import { persist } from "@/lib/mock/persistence";
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
    persist();
    return project;
  },

  update(id: string, patch: Partial<Project>): Project | undefined {
    const project = db.projects.find((p) => p.id === id);
    if (!project) return undefined;
    Object.assign(project, patch);
    persist();
    return project;
  },

  remove(id: string): boolean {
    const index = db.projects.findIndex((p) => p.id === id);
    if (index === -1) return false;
    db.projects.splice(index, 1);
    persist();
    return true;
  },

  all(): Project[] {
    return [...db.projects];
  },
};
