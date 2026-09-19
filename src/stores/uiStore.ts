import { create } from 'zustand';

export type ModalType = 'project' | 'experience' | 'blog' | 'testimonial' | 'confirm' | null;

interface ModalState {
  type: ModalType;
  isOpen: boolean;
  data: unknown;
}

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Modal
  modal: ModalState;

  // Active tab
  activeTab: string;

  // Loading
  globalLoading: boolean;
}

interface UIActions {
  // Sidebar
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;

  // Modal
  openModal: (type: ModalType, data?: unknown) => void;
  closeModal: () => void;

  // Tab
  setActiveTab: (tab: string) => void;

  // Loading
  setGlobalLoading: (loading: boolean) => void;
}

type UIStore = UIState & UIActions;

const initialState: UIState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  modal: {
    type: null,
    isOpen: false,
    data: null,
  },
  activeTab: 'dashboard',
  globalLoading: false,
};

export const useUIStore = create<UIStore>()((set) => ({
  ...initialState,

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) =>
    set({ sidebarOpen: open }),

  toggleSidebarCollapse: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  openModal: (type, data = null) =>
    set({
      modal: { type, isOpen: true, data },
    }),

  closeModal: () =>
    set({
      modal: { type: null, isOpen: false, data: null },
    }),

  setActiveTab: (tab) =>
    set({ activeTab: tab }),

  setGlobalLoading: (loading) =>
    set({ globalLoading: loading }),
}));

// Selectors
export const selectModal = (state: UIStore) => state.modal;
export const selectActiveTab = (state: UIStore) => state.activeTab;
export const selectSidebarOpen = (state: UIStore) => state.sidebarOpen;

export default useUIStore;
