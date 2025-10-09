import { ApiResponse, IndexRepositoryResponse } from "./type.d";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

export const indexRepository = async (repoUrl: string) => {
  const { data } = await axiosInstance.post<ApiResponse<IndexRepositoryResponse>>("/indexing", { repoUrl });
  return data.data;
};
