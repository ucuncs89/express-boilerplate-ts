import type { Knex } from "knex";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: ".env" });

// Get the root directory path
const rootDir = path.resolve(__dirname, "../..");
const srcDir = path.resolve(__dirname, "..");

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "ZXCasdqwe@123",
      database: process.env.DB_NAME || "db_logistic_app",
    },
    migrations: {
      directory: path.join(srcDir, "migrations"),
      extension: "ts",
    },
    seeds: {
      directory: path.join(srcDir, "seeders"),
      extension: "ts",
    },
  },
  production: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    migrations: {
      directory: path.join(srcDir, "migrations"),
      extension: "ts",
    },
    seeds: {
      directory: path.join(srcDir, "seeders"),
      extension: "ts",
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
};

export default config;
