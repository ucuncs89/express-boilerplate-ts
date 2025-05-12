import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../utils/errors";

// Extend Express Request interface to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * Authentication middleware to verify JWT tokens
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(
        new UnauthorizedError("Authorization denied: no token provided")
      );
    }

    // Get the token without Bearer prefix
    const token = authHeader.split(" ")[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

      // Add user to request object
      req.user = { id: decoded.id };
      next();
    } catch (tokenErr) {
      // Handle specific JWT errors
      if (tokenErr instanceof jwt.JsonWebTokenError) {
        return next(new UnauthorizedError("Token is invalid"));
      } else if (tokenErr instanceof jwt.TokenExpiredError) {
        return next(new UnauthorizedError("Token has expired"));
      } else {
        return next(new UnauthorizedError("Authentication failed"));
      }
    }
  } catch (err) {
    // Catch any other unexpected errors
    return next(new UnauthorizedError("Authentication failed"));
  }
};
