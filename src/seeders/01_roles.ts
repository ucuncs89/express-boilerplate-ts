import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("roles").del();

  // Inserts seed entries
  await knex("roles").insert([
    {
      id: 1,
      name: "Admin",
      description: "Administrator with full access",
    },
    {
      id: 2,
      name: "Manager",
      description: "Branch manager with limited admin access",
    },
    {
      id: 3,
      name: "Staff",
      description: "Regular staff member",
    },
    {
      id: 4,
      name: "Customer",
      description: "Customer account",
    },
  ]);
} 