--planning_account_limits (down)

ALTER TABLE planning_accounts DROP COLUMN limit_upper;
ALTER TABLE planning_accounts DROP COLUMN limit_lower;
