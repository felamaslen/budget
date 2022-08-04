--funds_units_rebased (down)

BEGIN;

DROP TRIGGER funds_transactions_insert_adjust ON funds_transactions;
DROP TRIGGER funds_transactions_update_adjust ON funds_transactions;
DROP FUNCTION insert_transaction_split_adj;
DROP FUNCTION update_transaction_split_adj;

DROP TRIGGER funds_stock_splits_adjust ON funds_stock_splits;
DROP FUNCTION update_split_adj;

DROP TRIGGER funds_cache_insert_adjust ON fund_cache;
DROP FUNCTION set_fund_cache_price_split_adj;

ALTER TABLE fund_cache
DROP COLUMN price_split_adj;

ALTER TABLE funds_transactions
DROP COLUMN units_split_adj
,DROP COLUMN price_split_adj;

COMMIT;
