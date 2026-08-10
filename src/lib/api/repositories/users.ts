import type { Role, User } from "@/lib/types";
import { db } from "@/lib/mock/data";
import { persist } from "@/lib/mock/persistence";

export const usersRepository = {
  list(): User[] {
    return [...db.users];
  },

  getById(id: string): User | undefined {
    return db.users.find((u) => u.id === id);
  },

  updateRole(id: string, role: Role): User | undefined {
    const user = db.users.find((u) => u.id === id);
    if (!user) return undefined;
    user.role = role;
    persist();
    return user;
  },

  countByRole(role: Role): number {
    return db.users.filter((u) => u.role === role).length;
  },
};
