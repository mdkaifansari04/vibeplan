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
