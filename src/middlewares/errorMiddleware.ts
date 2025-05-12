import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/responseHelper";
import { AppError } from "../utils/errors";
import logger from "../utils/logger";

/**
 * Not found middleware - handles 404 errors for routes that don't exist
 */
export const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!res.headersSent) {
    const message = `Route not found: ${req.method} ${req.originalUrl}`;
    logger.warn(message, { path: req.originalUrl, method: req.method });
    errorResponse(res, message, 404);
  }
};

/**
 * Global error handler middleware
 */
export const errorHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // If headers already sent, pass to Express's default error handler
  if (res.headersSent) {
    return next(err);
  }

  const reqInfo = {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    headers: req.headers,
  };

  // If the error is our custom AppError, use its status code
  if (err instanceof AppError) {
    const appError = err as AppError;

    if (appError.statusCode >= 500) {
      logger.error(err, { ...reqInfo, errors: appError.errors });
    } else {
      logger.warn(err, { ...reqInfo, errors: appError.errors });
    }

    errorResponse(
      res,
      appError.message,
      appError.statusCode,
      process.env.NODE_ENV === "production"
        ? undefined
        : {
            name: appError.name,
            errors: appError.errors,
          }
    );
    return;
  }

  // Handle Knex.js / database errors
  if (
    err.message &&
    (err.message.includes("SQLITE_CONSTRAINT") ||
      err.message.includes("FOREIGN KEY constraint failed") ||
      err.message.includes("duplicate key value") ||
      err.message.includes("Duplicate entry"))
  ) {
    logger.warn("Database constraint error", {
      ...reqInfo,
      error: err.message,
    });

    errorResponse(
      res,
      "Database constraint error. The record may already exist or have invalid references.",
      400,
      process.env.NODE_ENV === "production"
        ? undefined
        : {
            message: err.message,
          }
    );
    return;
  }

  // Handle validation errors (from express-validator, etc.)
  if (err.name === "ValidationError" || (err as any).errors) {
    logger.warn("Validation error", {
      ...reqInfo,
      errors: (err as any).errors || { message: err.message },
    });

    errorResponse(
      res,
      "Validation failed",
      422,
      (err as any).errors || { message: err.message }
    );
    return;
  }

  // Log all 500 errors with full details
  logger.exception(err, reqInfo);

  // Default error handling for unhandled errors
  errorResponse(
    res,
    err.message || "Internal Server Error",
    500,
    process.env.NODE_ENV === "production"
      ? undefined
      : {
          name: err.name,
        }
  );
};
