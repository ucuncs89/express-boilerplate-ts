import { Knex } from "knex";
import bcrypt from "bcrypt";

export async function seed(knex: Knex): Promise<void> {
  // Create a hashed password for the admin user
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("admin123", salt);

  // Check if admin user already exists
  const existingUser = await knex("users").where({ email: "admin@logistics.com" }).first();

  if (!existingUser) {
    // Insert admin user
    await knex("users").insert({
      name: "Admin User",
      email: "admin@logistics.com",
      password: hashedPassword,
      role_id: 1, // Admin role
      is_active: true,
    });
  }
} 