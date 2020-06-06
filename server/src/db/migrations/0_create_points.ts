import Knex from "knex";

export async function up(knex: Knex) {
  return knex.schema.createTable("points", (table) => {
    table.increments("idPoint").primary();
    table.string("image").notNullable();
    table.string("name").notNullable();
    table.string("email").notNullable();
    table.decimal("latitude").notNullable();
    table.decimal("longitude").notNullable();
    table.string("zipzorp").notNullable();
    table.string("cidade").notNullable();
    table.string("estado", 2).notNullable();
  });
}

export async function down(knex: Knex) {
  return knex.schema.dropTable("points");
}
