import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Phase } from "@/types/phase";

export interface PhaseState {
  phases: Phase[];
  isLoading: boolean;
  error: string | null;

  setPhases: (phases: Phase[]) => void;
  updatePhase: (phaseId: string, updatedPhase: Partial<Phase>) => void;
  addPhase: (phase: Phase) => void;
  removePhase: (phaseId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  phases: [],
  isLoading: false,
  error: null,
};

export const usePhaseStore = create<PhaseState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setPhases: (phases: Phase[]) => {
        set({
          phases,
          error: null,
          isLoading: false,
        });
      },

      updatePhase: (phaseId: string, updatedPhase: Partial<Phase>) => {
        const currentPhases = get().phases;
        const updatedPhases = currentPhases.map((phase) => (phase.id === phaseId ? { ...phase, ...updatedPhase } : phase));
        set({ phases: updatedPhases });
      },

      addPhase: (phase: Phase) => {
        const currentPhases = get().phases;
        set({ phases: [...currentPhases, phase] });
      },

      removePhase: (phaseId: string) => {
        const currentPhases = get().phases;
        const filteredPhases = currentPhases.filter((phase) => phase.id !== phaseId);
        set({ phases: filteredPhases });
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
      name: "phase-storage",
      storage: createJSONStorage(() => sessionStorage),

      partialize: (state) => ({
        phases: state.phases,
      }),

      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false;
          state.error = null;
        }
      },
    }
  )
);

export const usePhases = () => usePhaseStore((state) => state.phases);
export const usePhaseLoading = () => usePhaseStore((state) => state.isLoading);
export const usePhaseError = () => usePhaseStore((state) => state.error);

export const usePhaseActions = () => {
  const setPhases = usePhaseStore((state) => state.setPhases);
  const updatePhase = usePhaseStore((state) => state.updatePhase);
  const addPhase = usePhaseStore((state) => state.addPhase);
  const removePhase = usePhaseStore((state) => state.removePhase);
  const setLoading = usePhaseStore((state) => state.setLoading);
  const setError = usePhaseStore((state) => state.setError);
  const reset = usePhaseStore((state) => state.reset);

  return {
    setPhases,
    updatePhase,
    addPhase,
    removePhase,
    setLoading,
    setError,
    reset,
  };
};
