--pension_stocks (up)

ALTER TABLE funds_transactions
ADD COLUMN is_pension boolean NOT NULL DEFAULT false;

CREATE INDEX funds_transactions_is_pension ON funds_transactions USING btree (is_pension);
