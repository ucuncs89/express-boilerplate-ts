import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env" });

// Configuration object
const config = {
  app: {
    name: process.env.APP_NAME || "Logistics API",
    env: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "3000", 10),
    url: process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`,
  },
  db: {
    client: process.env.DB_CLIENT || "mysql2",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "ZXCasdqwe@123",
    database: process.env.DB_NAME || "db_logistic_app",
    debug: process.env.DB_DEBUG === "true",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: process.env.CORS_METHODS || "GET,HEAD,PUT,PATCH,POST,DELETE",
  },
  logging: {
    level: process.env.LOG_LEVEL || "info", // error, warn, info, http, debug
    format: process.env.LOG_FORMAT || "dev",
    toFile: process.env.LOG_TO_FILE === "true",
    directory: process.env.LOG_DIRECTORY || "logs",
    maxSize: process.env.LOG_MAX_SIZE || "20m",
    maxFiles: process.env.LOG_MAX_FILES || "14d",
    colorize: process.env.LOG_COLORIZE !== "false",
  },
};

export default config;
