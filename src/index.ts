import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
dotenv.config({ path: ".env" });

// Import routes
import authRoutes from "./http/auth/auth.routes";
import userRoutes from "./http/user/user.routes";
import packageRoutes from "./http/package/package.routes";

// Import middleware
import { errorHandlerMiddleware } from "./middlewares/errorMiddleware";
import { errorResponse } from "./utils/responseHelper";
import { globalSingleflightMiddleware } from "./middlewares/globalSingleflight";

const app = express();
const port = process.env.PORT || 3000;

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(
    `[DEBUG] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`
  );
  next();
});

// Middleware
app.use(globalSingleflightMiddleware);
app.use(helmet()); // Security headers
app.use(cors()); // CORS handling
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan("dev")); // Request logging

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date().toISOString() });
});

// API Routes
const apiRouter = express.Router();
app.use("/api", apiRouter);

// Debug middleware for API routes
apiRouter.use((req, res, next) => {
  console.log(
    `[DEBUG API] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`
  );
  next();
});

// Mount routes on API router
apiRouter.use("/auth", authRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/packages", packageRoutes);

// API welcome route
apiRouter.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Logistics API",
    version: "1.0.0",
    documentation: "/api-docs",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      packages: "/api/packages",
    },
  });
});

// Debug middleware for 404s
app.use((req, res, next) => {
  console.log(
    `[DEBUG 404] ${new Date().toISOString()} - Route not found: ${req.method} ${
      req.originalUrl
    }`
  );
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
  console.log(`Server is running on port ${port}`);
  console.log(`API documentation available at: http://localhost:${port}/api`);
  console.log(`Health check available at: http://localhost:${port}/health`);

  // Export routes after all routes are mounted and server is started
});
