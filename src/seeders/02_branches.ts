import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("branches").del();

  // Inserts seed entries
  await knex("branches").insert([
    {
      id: 1,
      name: "Jakarta Central",
      address: "Jl. Sudirman No. 123",
      city: "Jakarta",
      province: "DKI Jakarta",
      postal_code: "10220",
      phone: "021-5551234",
      email: "jakarta.central@logistics.com",
      is_active: true,
    },
    {
      id: 2,
      name: "Surabaya Main",
      address: "Jl. Pemuda No. 45",
      city: "Surabaya",
      province: "East Java",
      postal_code: "60271",
      phone: "031-5559876",
      email: "surabaya.main@logistics.com",
      is_active: true,
    },
    {
      id: 3,
      name: "Bandung Branch",
      address: "Jl. Asia Afrika No. 67",
      city: "Bandung",
      province: "West Java",
      postal_code: "40112",
      phone: "022-5554321",
      email: "bandung@logistics.com",
      is_active: true,
    },
  ]);
} 