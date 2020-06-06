import Knex from "knex";

export async function up(knex: Knex) {
  return knex.schema.createTable("pointItems", (table) => {
    table.increments("id").primary();
    table
      .integer("idPoint")
      .notNullable()
      .references("idPoint")
      .inTable("points");
    table.integer("idItem").notNullable().references("idItem").inTable("items");
  });
}

export async function down(knex: Knex) {
  return knex.schema.dropTable("pointItems");
}
