--planning_account_limits (up)

ALTER TABLE planning_accounts ADD COLUMN
  limit_upper integer DEFAULT NULL;

ALTER TABLE planning_accounts ADD COLUMN
  limit_lower integer DEFAULT NULL;
