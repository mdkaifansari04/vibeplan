import { Router } from "express";
import PlanController from "../controller/plan.controller";
import { generatePlanValidation } from "../../../validation/plan.validation";

const router = Router();

router.post("/generate", generatePlanValidation, PlanController.generatePlan);

export default router;
