import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
dotenv.config({ path: '.env' });

// Import routes
import authRoutes from './http/auth/auth.routes';

// Import middleware
import { errorHandlerMiddleware } from './middlewares/errorMiddleware';
import { errorResponse } from './utils/responseHelper';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS handling
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // Request logging

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Routes
app.use('/auth', authRoutes);

// API welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Logistics API',
    version: '1.0.0',
    documentation: '/api-docs'
  });
});

// 404 handler for undefined routes - must come after all defined routes
// Using Express's default 404 behavior by adding a middleware at the end
app.use((req, res) => {
  errorResponse(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
});

// Global error handler - must have 4 parameters for Express to recognize as error handler
app.use(errorHandlerMiddleware);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Health check available at: http://localhost:${port}/health`);
});