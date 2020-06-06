async function up(knex) {
  await knex.schema.dropTable('balance');
}

async function down(knex) {
  await knex.schema.createTable('balance', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('uid').notNullable().references('users.uid').onUpdate('CASCADE').onDelete('CASCADE');
    table.date('date').notNullable();
    table.integer('value').notNullable();
    table.unique(['uid', 'date']);
  });
}

module.exports = { up, down };
