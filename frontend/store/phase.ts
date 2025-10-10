import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Phase } from "@/types/phase";

export interface RelevantFiles {
  path: string;
  language: string;
  similarity: number;
}
export interface PhaseState {
  phases: Phase[];
  setPhases: (phases: Phase[], relevantFiles: RelevantFiles[]) => void;
  updatePhase: (phaseId: string, updatedPhase: Partial<Phase>) => void;
  reset: () => void;

  relevantFiles: RelevantFiles[];
  setRelevantFiles: (files: RelevantFiles[]) => void;
}

const initialState = {
  phases: [],
  relevantFiles: [],
};

export const usePhaseStore = create<PhaseState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setPhases: (phases: Phase[], relevantFiles: RelevantFiles[]) => {
        set({
          phases,
          relevantFiles,
        });
      },

      updatePhase: (phaseId: string, updatedPhase: Partial<Phase>) => {
        const currentPhases = get().phases;
        const updatedPhases = currentPhases.map((phase) => (phase.id === phaseId ? { ...phase, ...updatedPhase } : phase));
        set({ phases: updatedPhases });
      },

      setRelevantFiles: (files: RelevantFiles[]) => {
        set({ relevantFiles: files });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: "phase-storage",
      storage: createJSONStorage(() => sessionStorage),

      partialize: (state) => ({
        phases: state.phases,
      }),
    }
  )
);
