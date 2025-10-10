import { ApiResponse, IndexRepositoryResponse, GeneratePhaseRequest, GeneratePhaseResponse } from "./type.d";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

export const indexRepository = async (repoUrl: string) => {
  const { data } = await axiosInstance.post<ApiResponse<IndexRepositoryResponse>>("/indexing", { repoUrl });
  return data.data;
};

export const generatePhases = async (request: GeneratePhaseRequest) => {
  const { data } = await axiosInstance.post<ApiResponse<GeneratePhaseResponse>>("/phases/generate", request);
  return data.data;
};

export const generatePlan = async (phaseId: string) => {
  const { data } = await axiosInstance.post<ApiResponse<{ instruction: string; plan: string }>>("/plans/generate", { phaseId });
  return data.data;
};
