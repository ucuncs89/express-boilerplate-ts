import { Request, Response, NextFunction } from "express";

/**
 * Standard API Response Format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  result?: T;
  errors?: any;
  error?: any;
  pagination?: PaginationInfo;
}

/**
 * Pagination information
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Controller function type
 * For async Express route handlers that return data directly
 */
export type ControllerFunction = (
  req: Request,
  res: Response,
  next?: NextFunction
) => Promise<any>;

/**
 * Request with user information
 * Extends Express Request interface to include user information
 */
export interface AuthRequest extends Request {
  user?: {
    id: number;
    role?: string;
    [key: string]: any;
  };
}

/**
 * Response data with pagination
 */
export interface PaginatedData<T> {
  data: T[];
  pagination: PaginationInfo;
}

/**
 * Query parameters for pagination
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

/**
 * Controller response object
 */
export interface ControllerResponse<T = any> {
  message?: string;
  statusCode?: number;
  result?: T;
  pagination?: PaginationInfo;
}
