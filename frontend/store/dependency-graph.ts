import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { DependencyGraphData, AppNode, AppEdge, DependencyGraphStats } from "@/components/container/depedency-graph/types";

export interface DependencyGraphState {
  dependencyData: DependencyGraphData;

  setDependencyData: (data: DependencyGraphData) => void;
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

      setDependencyData: (data: DependencyGraphData) => {
        set({
          dependencyData: data,
        });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: "dependency-graph-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
