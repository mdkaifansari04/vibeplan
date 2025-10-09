import { indexRepository } from "./access-data";
import { useMutation } from "@tanstack/react-query";

export const useIndexRepository = () => {
  return useMutation({
    mutationKey: ["index-repository"],
    mutationFn: indexRepository,
  });
};
