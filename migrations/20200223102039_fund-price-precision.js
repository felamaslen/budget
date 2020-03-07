async function up(knex) {
  await knex.schema.alterTable('fund_cache', table => {
    table.double('price').alter();
  });
}

async function down(knex) {
  await knex.schema.alterTable('fund_cache', table => {
    table.float('price').alter();
  });
}

module.exports = { up, down };
