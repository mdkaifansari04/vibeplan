import { NextFunction } from "express";
import Joi from "joi";
import { Request, Response } from "express";
import { validateSchema } from "./schema-validation";
import { CustomRequest } from "../types";

export const generatePlanValidation = (req: CustomRequest, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    namespace: Joi.string().required().min(3).max(100),
    phase: Joi.object({
      id: Joi.string().required(),
      title: Joi.string().required().min(3).max(200),
      description: Joi.string().required().min(10).max(2000),
      relevantFiles: Joi.array().items(Joi.string()).default([]),
      dependencies: Joi.array().items(Joi.string()).default([]),
      estimatedComplexity: Joi.string().valid("low", "medium", "high").required(),
      priority: Joi.string().valid("low", "medium", "high").required(),
      category: Joi.string().valid("bug_fix", "feature", "refactor", "improvement", "documentation").required(),
      reasoning: Joi.string().required().min(10).max(1000),
    }).required(),
    topRelevantFiles: Joi.array()
      .items(
        Joi.object({
          path: Joi.string().required(),
          language: Joi.string().required(),
          similarity: Joi.number().min(0).max(1).required(),
        })
      )
      .min(1)
      .max(20)
      .required(),
  });
  validateSchema({ schema, req, next });
};
