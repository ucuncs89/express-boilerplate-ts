import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/responseHelper";
import { AppError } from "../utils/errors";

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

  // console.error(`[Error Handler] ${req.method} ${req.path}:`, err);

  // If the error is our custom AppError, use its status code
  if (err instanceof AppError) {
    const appError = err as AppError;
    errorResponse(
      res,
      appError.message,
      appError.statusCode,
      process.env.NODE_ENV === "production"
        ? undefined
        : {
            // stack: appError.stack,
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
    errorResponse(
      res,
      "Database constraint error. The record may already exist or have invalid references.",
      400,
      process.env.NODE_ENV === "production"
        ? undefined
        : {
            stack: err.stack,
            message: err.message,
          }
    );
    return;
  }

  // Handle validation errors (from express-validator, etc.)
  if (err.name === "ValidationError" || (err as any).errors) {
    errorResponse(
      res,
      "Validation failed",
      422,
      (err as any).errors || { message: err.message }
    );
    return;
  }

  // Default error handling for unhandled errors
  errorResponse(
    res,
    err.message || "Internal Server Error",
    500,
    process.env.NODE_ENV === "production"
      ? undefined
      : {
          stack: err.stack,
          name: err.name,
        }
  );
};
