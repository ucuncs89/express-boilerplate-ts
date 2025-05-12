import knex from "knex";
import config from "../config/knexfile";

// Get the current environment
const environment = process.env.NODE_ENV || "development";

// Create a database connection with the environment configuration
const db = knex(config[environment]);

// Test the connection
db.raw("SELECT 1")
  .then(() => {
    console.log("Database connection established successfully");
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
    process.exit(1); // Exit if we can't connect to the database
  });

export default db;
