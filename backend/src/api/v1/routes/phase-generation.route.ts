import { Router } from "express";
import PhaseGenerationController from "../controller/phase-generation.controller";
import { contextPreviewValidation, phaseGenerationValidation, promptAnalysisValidation } from "../../../validation/phase-generation.validation";

const router = Router();
router.post("/generate", phaseGenerationValidation, PhaseGenerationController.generatePhases);

export default router;
