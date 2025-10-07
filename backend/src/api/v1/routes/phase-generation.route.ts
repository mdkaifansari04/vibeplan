import { Router } from "express";
import PhaseGenerationController from "../controller/phase-generation.controller";
import { contextPreviewValidation, phaseGenerationValidation, promptAnalysisValidation } from "../../../validation/phase-generation.validation";

const router = Router();

/**
 * POST /api/v1/phases/generate
 * Generate atomic phases based on user prompt and repository context
 */
router.post("/generate", phaseGenerationValidation, PhaseGenerationController.generatePhases);

/**
 * POST /api/v1/phases/analyze
 * Analyze user prompt to understand intent and extract keywords
 */
router.post("/analyze", promptAnalysisValidation, PhaseGenerationController.analyzePrompt);

/**
 * POST /api/v1/phases/context
 * Get context preview for a given prompt and namespace
 */
router.post("/context", contextPreviewValidation, PhaseGenerationController.getContextPreview);

export default router;
