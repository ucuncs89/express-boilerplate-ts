import config from "../config";

type LogLevel = "error" | "warn" | "info" | "debug";

// Set colors for different log levels
const colors = {
  error: "\x1b[31m", // Red
  warn: "\x1b[33m", // Yellow
  info: "\x1b[36m", // Cyan
  debug: "\x1b[34m", // Blue
  reset: "\x1b[0m", // Reset color
};

/**
 * Simple logger utility that wraps console methods
 * Can be easily replaced with a more robust logger like winston later
 */
class Logger {
  private level: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.level = (config.logging.level as LogLevel) || "info";
    this.isDevelopment = config.app.env === "development";
  }

  /**
   * Check if the given log level should be logged based on the configured level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    };

    return levels[level] <= levels[this.level];
  }

  /**
   * Format message with timestamp and level
   */
  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `${colors[level]}[${timestamp}] [${level.toUpperCase()}]${
      colors.reset
    } ${message}`;
  }

  /**
   * Log error messages
   */
  error(message: string, ...meta: any[]): void {
    if (this.shouldLog("error")) {
      console.error(this.formatMessage("error", message), ...meta);
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, ...meta: any[]): void {
    if (this.shouldLog("warn")) {
      console.warn(this.formatMessage("warn", message), ...meta);
    }
  }

  /**
   * Log info messages
   */
  info(message: string, ...meta: any[]): void {
    if (this.shouldLog("info")) {
      console.info(this.formatMessage("info", message), ...meta);
    }
  }

  /**
   * Log debug messages
   */
  debug(message: string, ...meta: any[]): void {
    if (this.shouldLog("debug")) {
      console.debug(this.formatMessage("debug", message), ...meta);
    }
  }

  /**
   * Log HTTP requests (method, path, status, time)
   */
  http(method: string, path: string, status: number, time: number): void {
    if (this.shouldLog("info")) {
      const statusColor = status >= 400 ? colors.error : colors.info;
      const message = `${method} ${path} ${statusColor}${status}${colors.reset} ${time}ms`;
      console.info(this.formatMessage("info", message));
    }
  }
}

export default new Logger();
