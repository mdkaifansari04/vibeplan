import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Phase } from "@/types/phase";

export interface RelevantFiles {
  path: string;
  language: string;
  similarity: number;
}
export interface PhaseState {
  userPrompt: string;
  phases: Phase[];
  setPhases: (phases: Phase[]) => void;
  setUserPrompt: (prompt: string) => void;

  updatePhase: (phaseId: string, updatedPhase: Partial<Phase>) => void;
  reset: () => void;

  relevantFiles: RelevantFiles[];
  setRelevantFiles: (files: RelevantFiles[]) => void;
}

const initialState = {
  userPrompt: "",
  phases: [],
  relevantFiles: [],
};

export const usePhaseStore = create<PhaseState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setPhases: (phases: Phase[]) => {
        set({
          phases,
        });
      },

      setUserPrompt: (prompt: string) => {
        set({
          userPrompt: prompt,
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
    }
  )
);
