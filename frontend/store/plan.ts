import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Plan } from "@/types/phase";

export interface PlanState {
  plans: Plan[];
  setPlans: (plans: Plan[]) => void;
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

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: "plan-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
