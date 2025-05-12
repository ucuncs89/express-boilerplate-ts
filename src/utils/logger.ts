import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import config from "../config";
import { inspect } from "util";
import fs from "fs";

// Define custom log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: "red",
  warn: "yellow",
  info: "cyan",
  http: "green",
  debug: "blue",
};

// Add colors to winston
winston.addColors(colors);

// Custom format that handles errors
const formatError = winston.format((info) => {
  if (info.message instanceof Error) {
    info.message = info.message.stack || info.message.message;
  }
  return info;
});

// Create custom format for console output with colors
const consoleFormat = winston.format.combine(
  formatError(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: config.logging.colorize }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;

    let metaStr = "";

    // Format additional metadata excluding splat (winston internal)
    if (Object.keys(meta).length > 0) {
      if (meta.splat === undefined) {
        metaStr =
          "\n" + inspect(meta, { colors: config.logging.colorize, depth: 5 });
      } else if (Array.isArray(meta.splat) && meta.splat.length > 0) {
        metaStr =
          "\n" +
          inspect(meta.splat, { colors: config.logging.colorize, depth: 5 });
      }
    }

    return `[${timestamp}] [${level}]: ${message}${metaStr}`;
  })
);

// Create custom format for file output (no colors, but JSON)
const fileFormat = winston.format.combine(
  formatError(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.json()
);

// Define transports
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat,
    level: config.app.env === "production" ? "info" : config.logging.level,
  }),
];

// Add file transports in production or if explicitly configured
if (config.app.env === "production" || config.logging.toFile) {
  // Create logs directory if it doesn't exist
  const logsDir = path.join(process.cwd(), config.logging.directory);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // Add daily rotate file transport for all logs
  const dailyRotateFile = new winston.transports.DailyRotateFile({
    dirname: logsDir,
    filename: "application-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxSize: config.logging.maxSize,
    maxFiles: config.logging.maxFiles,
    format: fileFormat,
    level: config.logging.level,
  });

  transports.push(dailyRotateFile);

  // Add daily rotate file transport for error logs
  const errorRotateFile = new winston.transports.DailyRotateFile({
    dirname: logsDir,
    filename: "error-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxSize: config.logging.maxSize,
    maxFiles: config.logging.maxFiles,
    format: fileFormat,
    level: "error",
  });

  transports.push(errorRotateFile);
}

// Create the logger
const logger = winston.createLogger({
  level: config.logging.level,
  levels,
  transports,
  exitOnError: false,
});

/**
 * Enhanced logger that handles various data types more intelligently
 */
class Logger {
  /**
   * Log error messages with stack trace support
   */
  error(message: any, ...meta: any[]): void {
    logger.log("error", message, ...meta);
  }

  /**
   * Log warning messages
   */
  warn(message: any, ...meta: any[]): void {
    logger.log("warn", message, ...meta);
  }

  /**
   * Log info messages
   */
  info(message: any, ...meta: any[]): void {
    logger.log("info", message, ...meta);
  }

  /**
   * Log debug messages
   */
  debug(message: any, ...meta: any[]): void {
    logger.log("debug", message, ...meta);
  }

  /**
   * Log HTTP requests (method, path, status, time)
   */
  http(method: string, path: string, status: number, time: number): void {
    logger.log("http", `${method} ${path} ${status} ${time}ms`);
  }

  /**
   * Log objects (automatically stringify JSON)
   */
  object(
    level: "error" | "warn" | "info" | "debug",
    obj: any,
    message?: string
  ): void {
    if (message) {
      logger.log(level, message, obj);
    } else {
      logger.log(level, obj);
    }
  }

  /**
   * Log errors with full stack trace and details
   */
  exception(error: Error, context?: any): void {
    this.error(error, { context });
  }
}

export default new Logger();
