"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { User } from "@/lib/types";

const SessionContext = createContext<User | null>(null);

export function SessionProvider({ user, children }: { user: User; children: ReactNode }) {
  return <SessionContext.Provider value={user}>{children}</SessionContext.Provider>;
}

/** Access the current authenticated user on the client. */
export function useCurrentUser(): User {
  const user = useContext(SessionContext);
  if (!user) {
    throw new Error("useCurrentUser must be used within a SessionProvider");
  }
  return user;
}
