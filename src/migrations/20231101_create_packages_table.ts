import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('packages', (table) => {
    table.increments('id').primary();
    table.string('tracking_number').unique().notNullable();
    table.string('sender_name').notNullable();
    table.string('receiver_name').notNullable();
    table.text('sender_address').notNullable();
    table.text('receiver_address').notNullable();
    table.integer('origin_branch_id').unsigned().notNullable();
    table.foreign('origin_branch_id').references('id').inTable('branches');
    table.integer('destination_branch_id').unsigned().notNullable();
    table.foreign('destination_branch_id').references('id').inTable('branches');
    table.decimal('weight_kg', 8, 2).notNullable();
    table.decimal('volume_cm3', 10, 2).notNullable();
    table.decimal('price', 10, 2).notNullable();
    table.enum('status', ['Pending', 'In Transit', 'Delivered', 'Cancelled', 'Returned']).defaultTo('Pending');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('packages');
} 