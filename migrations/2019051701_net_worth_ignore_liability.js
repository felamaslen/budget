async function up(knex) {
    await knex.schema.table('net_worth_values', table => {
        table.boolean('skip')
            .defaultTo(null);
    });
}

async function down(knex) {
    await knex.schema.table('net_worth_values', table => {
        table.dropColumn('skip');
    });
}

module.exports = { up, down };
