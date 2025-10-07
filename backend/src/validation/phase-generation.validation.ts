import { NextFunction } from "express";
import Joi from "joi";
import { Request, Response } from "express";
import { validateSchema } from "./schema-validation";
import { CustomRequest } from "../types";

export const phaseGenerationValidation = (req: CustomRequest, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    namespace: Joi.string().required().min(3).max(100),
    userPrompt: Joi.string().required().min(5).max(1000),
    contextType: Joi.string().optional().valid("specific", "improvement", "refactor", "debug", "feature"),
  });
  validateSchema({ schema, req, next });
};

export const promptAnalysisValidation = (req: CustomRequest, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    user_prompt: Joi.string().required().min(5).max(1000),
  });
  validateSchema({ schema, req, next });
};

export const contextPreviewValidation = (req: CustomRequest, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    namespace: Joi.string().required().min(3).max(100),
    user_prompt: Joi.string().required().min(5).max(1000),
    context_type: Joi.string().optional().valid("specific", "improvement", "refactor", "debug", "feature"),
  });
  validateSchema({ schema, req, next });
};
