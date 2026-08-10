"use client";

import { create } from "zustand";

interface NotificationsState {
  readIds: string[];
  dismissedIds: string[];
  markRead: (id: string) => void;
  markAllRead: (ids: string[]) => void;
  dismiss: (id: string) => void;
  isRead: (id: string) => boolean;
  isDismissed: (id: string) => boolean;
}

/**
 * Client-only notification read/dismiss state. Seeded from server alerts; a real
 * app would persist read receipts per user via the API.
 */
export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  readIds: [],
  dismissedIds: [],
  markRead: (id) =>
    set((s) => (s.readIds.includes(id) ? s : { readIds: [...s.readIds, id] })),
  markAllRead: (ids) =>
    set((s) => ({ readIds: Array.from(new Set([...s.readIds, ...ids])) })),
  dismiss: (id) =>
    set((s) => ({
      dismissedIds: s.dismissedIds.includes(id)
        ? s.dismissedIds
        : [...s.dismissedIds, id],
    })),
  isRead: (id) => get().readIds.includes(id),
  isDismissed: (id) => get().dismissedIds.includes(id),
}));
