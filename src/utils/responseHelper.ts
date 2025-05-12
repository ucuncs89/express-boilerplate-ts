import { Response } from "express";

/**
 * Standard API Response Format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  result?: T;
  errors?: any;
  error?: any;
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * Success response helper
 * @param res Express Response object
 * @param result Response result
 * @param message Success message
 * @param statusCode HTTP status code (default: 200)
 * @param pagination Pagination information
 */
export const successResponse = <T>(
  res: Response,
  result: T,
  message: string = "Success",
  statusCode: number = 200,
  pagination?: ApiResponse["pagination"]
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    result,
    pagination,
  });
};

/**
 * Error response helper
 * @param res Express Response object
 * @param message Error message
 * @param statusCode HTTP status code (default: 500)
 * @param error Error details or validation errors
 */
export const errorResponse = (
  res: Response,
  message: string = "Internal Server Error",
  statusCode: number = 500,
  error?: any
): Response => {
  // Base response object
  const responseObj: {
    success: boolean;
    message: string;
    errors?: any;
    error?: any;
  } = {
    success: false,
    message,
  };

  // For validation errors (422), use 'errors' field
  if (statusCode === 422 && error && error.errors) {
    responseObj.errors = error.errors;
  }
  // For other errors, use the 'error' field
  else if (error) {
    responseObj.error = error;
  }

  return res.status(statusCode).json(responseObj);
};

/**
 * Created resource response helper
 * @param res Express Response object
 * @param result Response result
 * @param message Success message
 */
export const createdResponse = <T>(
  res: Response,
  result: T,
  message: string = "Resource created successfully"
): Response => {
  return successResponse(res, result, message, 201);
};

/**
 * Not found response helper
 * @param res Express Response object
 * @param message Error message
 */
export const notFoundResponse = (
  res: Response,
  message: string = "Resource not found"
): Response => {
  return errorResponse(res, message, 404);
};

/**
 * Bad request response helper
 * @param res Express Response object
 * @param message Error message
 * @param error Error details
 */
export const badRequestResponse = (
  res: Response,
  message: string = "Bad request",
  error?: any
): Response => {
  return errorResponse(res, message, 400, error);
};

/**
 * Unauthorized response helper
 * @param res Express Response object
 * @param message Error message
 */
export const unauthorizedResponse = (
  res: Response,
  message: string = "Unauthorized access"
): Response => {
  return errorResponse(res, message, 401);
};

/**
 * Forbidden response helper
 * @param res Express Response object
 * @param message Error message
 */
export const forbiddenResponse = (
  res: Response,
  message: string = "Access forbidden"
): Response => {
  return errorResponse(res, message, 403);
};
