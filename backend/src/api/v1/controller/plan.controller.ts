import { CustomRequest } from "../../../types";
import { NextFunction, Response } from "express";
import { PlanService } from "../services/plan.service";
import ErrorResponse from "../../../middleware/error-response";
import { GeneratePlanPayload } from "./type";

class PlanController {
  private readonly planService: PlanService;
  constructor() {
    this.planService = new PlanService();
  }
  public async generatePlan(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const { topRelevantFiles, phase }: GeneratePlanPayload = req.value;
      const result = await this.planService.generatePlan({ topRelevantFiles, phase });
      res.status(200).json(result);
    } catch (error) {
      next(new ErrorResponse("Failed to generate plan", 500));
    }
  }
}

export default new PlanController();
