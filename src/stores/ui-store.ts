"use client";

import { create } from "zustand";

interface UiState {
  sidebarOpen: boolean;
  commandOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setCommandOpen: (open: boolean) => void;
}

/** Client-only UI state (sidebar/drawer, command palette). */
export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  commandOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setCommandOpen: (open) => set({ commandOpen: open }),
}));
