import mongoose from "mongoose";
import { ZodError } from "zod";
import { AppError } from "../common/errors/app-error.js";
import { sendError } from "../common/http/api-response.js";
import { env } from "../config/env.js";

function isBodyParserError(error) {
  return error instanceof SyntaxError && typeof error.type === "string";
}

function isDuplicateKey(error) {
  return typeof error === "object" && error !== null && error.code === 11000;
}

export function errorHandler(error, req, res, _next) {
  if (res.headersSent) {
    req.log?.error({ err: error }, "Error after headers were sent");
    return;
  }

  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      req.log?.error({ err: error, code: error.code }, error.message);
    }
    sendError(res, error.statusCode, error.code, error.message, error.details);
    return;
  }

  if (error instanceof ZodError) {
    sendError(res, 400, "VALIDATION_ERROR", "Request validation failed", error.flatten());
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    sendError(res, 400, "VALIDATION_ERROR", "Document validation failed", error.errors);
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    sendError(res, 400, "INVALID_ID", "A provided identifier is not valid");
    return;
  }

  if (isDuplicateKey(error)) {
    sendError(res, 409, "CONFLICT", "A record with this value already exists", error.keyValue);
    return;
  }

  if (isBodyParserError(error)) {
    const statusCode = error.type === "entity.too.large" ? 413 : 400;
    const code = statusCode === 413 ? "PAYLOAD_TOO_LARGE" : "INVALID_JSON";
    const message = statusCode === 413 ? "Request body is too large" : "Request body must be valid JSON";
    sendError(res, statusCode, code, message);
    return;
  }

  req.log?.error({ err: error }, "Unhandled error");
  const message = !env.isProduction && error instanceof Error ? error.message : "Something went wrong";
  sendError(res, 500, "INTERNAL_ERROR", message);
}
