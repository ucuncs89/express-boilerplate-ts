import knex from "knex";
import config from "../config/knexfile";

// Get the current environment
const environment = process.env.NODE_ENV || "development";

// Create a database connection with the environment configuration
const db = knex(config[environment]);

export default db;
