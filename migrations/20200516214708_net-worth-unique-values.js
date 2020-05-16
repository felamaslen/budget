async function up(knex) {
  await knex.schema.alterTable('net_worth_values', table => {
    table.unique(['net_worth_id', 'subcategory']);
  });
  await knex.schema.alterTable('net_worth_credit_limit', table => {
    table.unique(['net_worth_id', 'subcategory']);
  });
  await knex.schema.alterTable('net_worth_fx_values', table => {
    table.unique(['values_id', 'currency']);
  });
  await knex.schema.alterTable('net_worth_currencies', table => {
    table.dropIndex(['net_worth_id', 'currency']);
  });
  await knex.schema.alterTable('net_worth_currencies', table => {
    table.unique(['net_worth_id', 'currency']);
  });
}

async function down(knex) {
  await knex.schema.alterTable('net_worth_values', table => {
    table.dropUnique(['net_worth_id', 'subcategory']);
  });
  await knex.schema.alterTable('net_worth_credit_limit', table => {
    table.dropUnique(['net_worth_id', 'subcategory']);
  });
  await knex.schema.alterTable('net_worth_fx_values', table => {
    table.dropUnique(['values_id', 'currency']);
  });
  await knex.schema.alterTable('net_worth_currencies', table => {
    table.dropUnique(['net_worth_id', 'currency']);
  });
  await knex.schema.alterTable('net_worth_currencies', table => {
    table.index(['net_worth_id', 'currency']);
  });
}

module.exports = { up, down };
