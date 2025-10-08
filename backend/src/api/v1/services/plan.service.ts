import { GeneratePlanPayload } from "../controller/type";
import { EmbeddingService } from "./embedding.service";
import { LLMService } from "./llm.service";

interface DetailedPlanResponse {
  plan: string;
  instruction: string;
}

export class PlanService {
  private readonly llmService: LLMService;
  constructor() {
    this.llmService = new LLMService();
  }

  public async generatePlan(body: GeneratePlanPayload): Promise<DetailedPlanResponse> {
    return this.llmService.generateDetailedPlan(body);
  }
}
