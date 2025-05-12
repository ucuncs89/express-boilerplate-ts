import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import fs from "fs";
import logger from "./utils/logger";

dotenv.config({ path: ".env" });

// Import middleware
import { errorHandlerMiddleware } from "./middlewares/error.middleware";
import { errorResponse } from "./utils/response-helper";
import { globalSingleflightMiddleware } from "./middlewares/global-singleflight.middleware";
import { registerRoutes, getRoutesAsJson } from "./utils/auto-router";

const app = express();
const port = process.env.PORT || 3000;

// Request logger middleware - logs at start of request
app.use((req, res, next) => {
  const startTime = Date.now();

  // Log when request comes in
  logger.info(`${req.method} ${req.originalUrl} - Request received`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });

  // Log when response is sent
  res.on("finish", () => {
    const responseTime = Date.now() - startTime;
    logger.http(req.method, req.originalUrl, res.statusCode, responseTime);
  });

  next();
});

// Middleware
app.use(globalSingleflightMiddleware);
app.use(helmet()); // Security headers
app.use(cors()); // CORS handling
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date().toISOString() });
});

// Register all routes automatically
const routes = registerRoutes(app, path.join(__dirname, "http"), {
  verbose: true,
  baseApiPath: "/api",
  excludeDirs: ["node_modules", "dist", ".git"],
});

// Save routes to JSON file
const routesDir = path.join(process.cwd(), "routes");
if (!fs.existsSync(routesDir)) {
  fs.mkdirSync(routesDir);
}
fs.writeFileSync(path.join(routesDir, "routes.json"), getRoutesAsJson(routes));

// API welcome route
app.get("/api", (req, res) => {
  res.json({
    message: "Welcome to the Logistics API",
    version: "1.0.0",
    documentation: "/api-docs",
  });
});

// Add a route to view all available routes
app.get("/api/routes", (req, res) => {
  res.json({
    total: routes.length,
    routes: routes.map((route) => ({
      path: route.fullPath,
      method: route.method,
      protected: route.protected,
      description: route.description || "",
    })),
  });
});

// Debug middleware for 404s - Log 404 errors
app.use((req, res, next) => {
  const message = `Route not found: ${req.method} ${req.originalUrl}`;
  logger.warn(message, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });
  next();
});

// 404 handler for undefined routes - must come after all defined routes
app.use((req, res) => {
  errorResponse(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
});

// Global error handler - must have 4 parameters for Express to recognize as error handler
app.use(errorHandlerMiddleware);

// Start the server
const server = app.listen(port, () => {
  logger.info(`Server is running on port ${port}`, {
    port,
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version,
  });
  logger.info(`API documentation available at: http://localhost:${port}/api`);
  logger.info(`Health check available at: http://localhost:${port}/health`);
  logger.info(
    `All API routes available at: http://localhost:${port}/api/routes`
  );
});
