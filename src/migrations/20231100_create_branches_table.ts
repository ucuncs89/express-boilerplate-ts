import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('branches', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.text('address').notNullable();
    table.string('city').notNullable();
    table.string('province').notNullable();
    table.string('postal_code').notNullable();
    table.string('phone').notNullable();
    table.string('email');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('branches');
} 