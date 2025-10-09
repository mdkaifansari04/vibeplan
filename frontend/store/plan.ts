import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Plan } from "@/types/phase";

export interface PlanState {
  plans: Plan[];
  isLoading: boolean;
  error: string | null;

  setPlans: (plans: Plan[]) => void;
  addPlan: (plan: Plan) => void;
  updatePlan: (phaseId: string, planData: { instruction: string; plan: string }) => void;
  removePlan: (phaseId: string, index?: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  plans: [],
  isLoading: false,
  error: null,
};

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setPlans: (plans: Plan[]) => {
        set({
          plans,
          error: null,
          isLoading: false,
        });
      },

      addPlan: (plan: Plan) => {
        const currentPlans = get().plans;
        set({ plans: [...currentPlans, plan] });
      },

      updatePlan: (phaseId: string, planData: { instruction: string; plan: string }) => {
        const currentPlans = get().plans;
        const existingPlanIndex = currentPlans.findIndex((p) => p.phaseId === phaseId);

        if (existingPlanIndex >= 0) {
          const updatedPlans = currentPlans.map((plan, index) => (index === existingPlanIndex ? { ...plan, data: planData } : plan));
          set({ plans: updatedPlans });
        } else {
          const newPlan: Plan = { phaseId, data: planData };
          set({ plans: [...currentPlans, newPlan] });
        }
      },

      removePlan: (phaseId: string, index?: number) => {
        const currentPlans = get().plans;
        if (index !== undefined) {
          const plansForPhase = currentPlans.filter((p) => p.phaseId === phaseId);
          if (plansForPhase.length > index) {
            const filteredPlans = currentPlans.filter((plan, i) => {
              const phaseMatchingPlans = currentPlans.filter((p) => p.phaseId === phaseId);
              const planIndex = phaseMatchingPlans.indexOf(plan);
              return !(plan.phaseId === phaseId && planIndex === index);
            });
            set({ plans: filteredPlans });
          }
        } else {
          const filteredPlans = currentPlans.filter((plan) => plan.phaseId !== phaseId);
          set({ plans: filteredPlans });
        }
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
      name: "plan-storage",
      storage: createJSONStorage(() => sessionStorage),

      partialize: (state) => ({
        plans: state.plans,
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

export const usePlans = () => usePlanStore((state) => state.plans);
export const usePlanLoading = () => usePlanStore((state) => state.isLoading);
export const usePlanError = () => usePlanStore((state) => state.error);

export const usePlansForPhase = (phaseId: string) => usePlanStore((state) => state.plans.filter((plan) => plan.phaseId === phaseId));

export const usePlanActions = () => {
  const setPlans = usePlanStore((state) => state.setPlans);
  const addPlan = usePlanStore((state) => state.addPlan);
  const updatePlan = usePlanStore((state) => state.updatePlan);
  const removePlan = usePlanStore((state) => state.removePlan);
  const setLoading = usePlanStore((state) => state.setLoading);
  const setError = usePlanStore((state) => state.setError);
  const reset = usePlanStore((state) => state.reset);

  return {
    setPlans,
    addPlan,
    updatePlan,
    removePlan,
    setLoading,
    setError,
    reset,
  };
};
