import { GeneratePlanPayload } from "../controller/type";
import { EmbeddingService } from "./embedding.service";
import { LLMService } from "./llm.service";

export class PlanService {
  private readonly llmService: LLMService;
  constructor() {
    this.llmService = new LLMService();
  }

  public async generatePlan(body: GeneratePlanPayload): Promise<any> {
    return this.llmService.generateDetailedPlan(body);
  }
}
