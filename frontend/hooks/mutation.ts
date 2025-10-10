import { indexRepository, generatePhases, generatePlan } from "./access-data";
import { useMutation } from "@tanstack/react-query";

export const useIndexRepository = () => {
  return useMutation({
    mutationKey: ["index-repository"],
    mutationFn: indexRepository,
  });
};

export const useGeneratePhases = () => {
  return useMutation({
    mutationKey: ["generate-phases"],
    mutationFn: generatePhases,
  });
};

export const useGeneratePlan = () => {
  return useMutation({
    mutationKey: ["generate-plan"],
    mutationFn: generatePlan,
  });
};
