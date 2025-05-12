import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const inflightRequests = new Map<string, Promise<any>>();

/**
 * Generate a unique key based on method, URL, and body.
 */
function generateKey(req: Request): string {
  const { method, originalUrl, body } = req;
  const hash = crypto.createHash("sha256");
  hash.update(method + originalUrl + JSON.stringify(body || {}));
  return hash.digest("hex");
}

/**
 * Global singleflight middleware to deduplicate in-flight requests.
 */
export function globalSingleflightMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const key = generateKey(req);

  // Only apply to GET/POST requests (you can customize this logic)
  if (!["GET", "POST"].includes(req.method.toUpperCase())) {
    return next();
  }

  if (inflightRequests.has(key)) {
    inflightRequests
      .get(key)!
      .then((data) => {
        res.json(data);
      })
      .catch((err) => next(err));
    return;
  }

  const originalJson = res.json.bind(res);

  // Hijack res.json to capture the response
  const jsonPromise = new Promise<any>((resolve, reject) => {
    res.json = (body: any) => {
      resolve(body);
      return originalJson(body); // Continue normal response
    };

    res.on("close", () => inflightRequests.delete(key));
    res.on("error", (err) => {
      inflightRequests.delete(key);
      reject(err);
    });
  });

  inflightRequests.set(key, jsonPromise);

  next();
}
