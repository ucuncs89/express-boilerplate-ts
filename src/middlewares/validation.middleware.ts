import { Request, Response, NextFunction } from "express";
import { ValidationChain, validationResult } from "express-validator";
import { ValidationError } from "../utils/errors";

/**
 * Middleware to validate request data using express-validator
 * @param validations Array of express-validator ValidationChain objects
 */
export const validate = (validations: ValidationChain[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Run all validations
      await Promise.all(validations.map((validation) => validation.run(req)));

      // Check if there are validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Format validation errors as field: message object
        const formattedErrors = errors
          .array()
          .reduce((acc: Record<string, string>, error: any) => {
            const field = error.path || error.param || "unknown";
            acc[field] = error.msg;
            return acc;
          }, {});

        // Throw a validation error that will be caught by the global error handler
        // This will return a response with statusCode: 422, errors: { field: message }
        // console.log(formattedErrors);

        return next(new ValidationError("Validation failed", formattedErrors));
      }

      next();
    } catch (error) {
      // logger.error("Validation error:", error);
      throw new ValidationError("Validation processing failed");
    }
  };
};
