import { NextFunction } from "express";
import Joi from "joi";
import { Request, Response } from "express";
import { validateSchema } from "./schema-validation";
import { CustomRequest } from "../types";

export const indexingRouteValidation = (req: CustomRequest, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    repoUrl: Joi.string().required(),
    branch: Joi.string().optional().default("main"),
  });
  validateSchema({ schema, req, next });
};

export const searchRouteValidation = (req: CustomRequest, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    repoUrl: Joi.string().required(),
    branch: Joi.string().optional().default("main"),
    query: Joi.string().required().min(1),
    limit: Joi.number().optional().min(1).max(100).default(10),
  });
  validateSchema({ schema, req, next });
};
