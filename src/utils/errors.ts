/**
 * Custom error classes for application
 *
 * This file contains all custom error classes used in the application.
 * Each error class extends the base AppError class and sets a specific HTTP status code.
 */

/**
 * Base application error class with HTTP status code
 */
export class AppError extends Error {
  statusCode: number;
  errors?: any;

  constructor(message: string, statusCode: number = 500, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not Found Error (404)
 * Used when a requested resource doesn't exist
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

/**
 * Bad Request Error (400)
 * Used for malformed requests or invalid data
 */
export class BadRequestError extends AppError {
  constructor(message: string = "Bad request", errors?: any) {
    super(message, 400, errors);
  }
}

/**
 * Unauthorized Error (401)
 * Used when authentication is required but has failed or not provided
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized access") {
    super(message, 401);
  }
}

/**
 * Forbidden Error (403)
 * Used when a user is authenticated but doesn't have permission
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Access forbidden") {
    super(message, 403);
  }
}

/**
 * Validation Error (422)
 * Used for validation errors from request data
 */
export class ValidationError extends AppError {
  constructor(message: string = "Validation error", errors?: any) {
    super(message, 422, errors);
  }
}

/**
 * Conflict Error (409)
 * Used when a request conflicts with the current state of the server
 */
export class ConflictError extends AppError {
  constructor(message: string = "Resource conflict", errors?: any) {
    super(message, 409, errors);
  }
}

/**
 * Service Unavailable Error (503)
 * Used when the server is not ready to handle the request
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = "Service unavailable") {
    super(message, 503);
  }
}
