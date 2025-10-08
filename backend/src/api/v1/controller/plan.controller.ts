import { CustomRequest } from "../../../types";
import { NextFunction, Response } from "express";
import { PlanService } from "../services/plan.service";
import ErrorResponse from "../../../middleware/error-response";
import { GeneratePlanPayload } from "./type";
import pinecone from "../../../libs/pinecone";
import { baseConfig } from "../../../libs/constant";
class PlanController {
  private readonly planService: PlanService;
  constructor() {
    this.planService = new PlanService();
  }
  public generatePlan = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const { topRelevantFiles, phase, namespace }: GeneratePlanPayload = req.value;
      const index = pinecone.Index(baseConfig.indexName);
      const namespaceIndex = index.namespace(namespace);
      if (!namespaceIndex) {
        return next(new ErrorResponse(`Namespace ${namespace} does not exist in Pinecone`, 400));
      }
      const result = await this.planService.generatePlan({ topRelevantFiles, phase, namespace });
      res.status(200).json({
        success: true,
        data: result,
        message: "Detailed plan generated successfully",
      });
    } catch (error) {
      console.error("Plan generation error:", error);
      next(new ErrorResponse("Failed to generate plan", 500));
    }
  };
}

export default new PlanController();
