async function up(knex) {
    await knex.schema.dropTableIfExists('income');
    await knex.schema.dropTableIfExists('bills');
    await knex.schema.dropTableIfExists('food');
    await knex.schema.dropTableIfExists('general');
    await knex.schema.dropTableIfExists('social');
    await knex.schema.dropTableIfExists('holiday');
    await knex.schema.dropTableIfExists('balance');

    await knex.schema.dropTableIfExists('fund_cache');
    await knex.schema.dropTableIfExists('fund_cache_time');
    await knex.schema.dropTableIfExists('fund_hash');
    await knex.schema.dropTableIfExists('funds_transactions');
    await knex.schema.dropTableIfExists('funds');
    await knex.schema.dropTableIfExists('stocks');
    await knex.schema.dropTableIfExists('stock_codes');

    await knex.schema.dropTableIfExists('ip_login_req');
    await knex.schema.dropTableIfExists('users');
}

module.exports = { up, down: up };

