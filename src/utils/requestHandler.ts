import { Request, Response, NextFunction } from "express";
import { errorResponse, successResponse } from "./responseHelper";
import { ValidationError } from "./errors";

/**
 * Type for async Express route handlers that return data directly
 */
export type ControllerFunction = (
  req: Request,
  res: Response,
  next?: NextFunction
) => Promise<any>;

/**
 * Wraps an async controller function to automatically handle responses
 * - If the function returns any value (object, array, etc), it will be sent as a success response
 * - If the function throws an error, it will be caught and sent as an error response
 * - No need to call response methods in the controller
 * @param fn Controller function that returns data or throws errors
 * @param defaultMessage Default success message
 */
export const controller = (
  fn: ControllerFunction,
  defaultMessage: string = "Success"
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Execute the controller function and get the result
      const result = await fn(req, res, next);

      // If headers are already sent (e.g., by streaming response or manual handling), do nothing
      if (res.headersSent) {
        return;
      }

      // If the function returned a value (not undefined), send it as a success response
      if (result !== undefined) {
        // If the result has a custom message, use it, otherwise use the default
        const message = result?.message || defaultMessage;

        // If the result has a status code, use it
        const statusCode = result?.statusCode || 200;

        // If the result has pagination info, pass it through
        const pagination = result?.pagination;

        // Check if the result has a 'result' property, if so use that as the result
        // otherwise use the entire result object
        const responseData =
          result?.result !== undefined ? result.result : result;

        // Send the success response
        successResponse(res, responseData, message, statusCode, pagination);
      }
      // If no result and headers not sent, assume it was handled manually or needs no response
    } catch (error: any) {
      // Log the error
      console.error(`[Controller Error] ${req.method} ${req.path}:`, error);

      // Determine the status code
      const statusCode = error.statusCode || 500;

      // Get the error message
      const message = error.message || "Internal Server Error";

      // For validation errors, format them correctly
      if (error instanceof ValidationError || statusCode === 422) {
        errorResponse(res, message, statusCode, { errors: error.errors });
        return;
      }

      // For non-validation errors in development mode, include stack trace
      const errorDetails =
        process.env.NODE_ENV === "production"
          ? undefined
          : {
              // stack: error.stack,
              name: error.name,
            };

      // Send the error response
      errorResponse(res, message, statusCode, errorDetails);
    }
  };
};

// Alias for backward compatibility
export const asyncHandler = controller;
