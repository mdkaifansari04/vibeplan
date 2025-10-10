import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Plan } from "@/types/phase";

export interface PlanState {
  plans: Plan[];
  setPlans: (plans: Plan[]) => void;
  addPlan: (plan: Plan) => void;
  updatePlan: (phaseId: string, planData: { instruction: string; plan: string }) => void;
  removePlan: (phaseId: string, index?: number) => void;
  reset: () => void;
}

const initialState = {
  plans: [],
};

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setPlans: (plans: Plan[]) => {
        set({
          plans,
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
    }
  )
);
