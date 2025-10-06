import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import ErrorResponse from "../middleware/error-response";
import { CustomRequest } from "../types";

export const validateSchema = ({ schema, req, next }: { schema: Joi.ObjectSchema; req: CustomRequest; next: NextFunction }) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    console.error("Validation error ->", error.details);
    return next(new ErrorResponse(error.details.map((detail) => detail.message).join(", "), 400));
  }
  req.value = value;
  next();
};
