import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { DependencyGraphData, AppNode, AppEdge, DependencyGraphStats } from "@/components/container/depedency-graph/types";

export interface DependencyGraphState {
  // State
  dependencyData: DependencyGraphData;
  isLoading: boolean;
  error: string | null;

  // Actions
  setDependencyData: (data: DependencyGraphData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  dependencyData: {
    nodes: [],
    edges: [],
    stats: {
      totalFiles: 0,
      totalDependencies: 0,
      languages: [],
      entryPoints: [],
    },
  } as DependencyGraphData,
  isLoading: false,
  error: null,
};

export const useDependencyGraphStore = create<DependencyGraphState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Actions
      setDependencyData: (data: DependencyGraphData) => {
        set({
          dependencyData: data,
          error: null,
          isLoading: false,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: "dependency-graph-storage", // name of the item in storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // use session storage
      // Optionally, you can specify which parts of the state to persist
      partialize: (state) => ({
        dependencyData: state.dependencyData,
        // We don't persist isLoading and error as they're transient
      }),
      // Handle hydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false;
          state.error = null;
        }
      },
    }
  )
);

// Selector hooks for better performance
export const useDependencyData = () => useDependencyGraphStore((state) => state.dependencyData);
export const useDependencyLoading = () => useDependencyGraphStore((state) => state.isLoading);
export const useDependencyError = () => useDependencyGraphStore((state) => state.error);

// Actions selector - using individual functions to avoid infinite loops
export const useDependencyActions = () => {
  const setDependencyData = useDependencyGraphStore((state) => state.setDependencyData);
  const setLoading = useDependencyGraphStore((state) => state.setLoading);
  const setError = useDependencyGraphStore((state) => state.setError);
  const reset = useDependencyGraphStore((state) => state.reset);

  return {
    setDependencyData,
    setLoading,
    setError,
    reset,
  };
};
