import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  filterDrawerOpen: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  toggleFilterDrawer: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  closeMobileMenu: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  mobileMenuOpen: false,
  filterDrawerOpen: false,
  theme: 'light',
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  toggleFilterDrawer: () => set((s) => ({ filterDrawerOpen: !s.filterDrawerOpen })),
  setTheme: (theme) => set({ theme }),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
}));
