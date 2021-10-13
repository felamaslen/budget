--planning_bills_account (up)

ALTER TABLE planning_accounts ADD COLUMN include_bills boolean DEFAULT NULL;

CREATE UNIQUE INDEX planning_accounts_include_bills_unique
  ON planning_accounts (uid)
  WHERE include_bills;
