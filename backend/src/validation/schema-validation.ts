import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import ErrorResponse from "../middleware/error-response";
import { CustomRequest } from "../types";

export const validateSchema = ({ schema, req, next }: { schema: Joi.ObjectSchema; req: CustomRequest; next: NextFunction }) => {
  if (!req.body || typeof req.body !== "object") {
    return next(new ErrorResponse("Request body is required and must be a valid JSON object", 400));
  }

  const { error, value } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return next(new ErrorResponse(error.details.map((detail) => detail.message).join(", "), 400));
  }

  req.value = value;
  next();
};
