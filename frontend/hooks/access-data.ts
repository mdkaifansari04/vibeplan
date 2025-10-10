import { Phase } from "@/types/phase";
import { ApiResponse, IndexRepositoryResponse, GeneratePhaseRequest, GeneratePhaseResponse, PlanGenerationResponse } from "./type.d";
import axios from "axios";
import { RelevantFiles } from "@/store/phase";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

export const indexRepository = async (body: { repoUrl: string; branch: string }) => {
  const { data } = await axiosInstance.post<ApiResponse<IndexRepositoryResponse>>("/indexing", body);
  return data.data;
};

export const generatePhases = async (request: GeneratePhaseRequest) => {
  const { data } = await axiosInstance.post<ApiResponse<GeneratePhaseResponse>>("/phases/generate", request);
  return data.data;
};

export const generatePlan = async (body: { namespace: string; phase: Phase; topRelevantFiles: RelevantFiles[] }) => {
  const { data } = await axiosInstance.post<ApiResponse<PlanGenerationResponse>>("/plans/generate", body);
  return data.data;
};
