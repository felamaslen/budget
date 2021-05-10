--bucket_investment (up)

CREATE TABLE bucket_investment (
  uid integer NOT NULL,
  value integer NOT NULL
);

ALTER TABLE bucket_investment
  ADD CONSTRAINT bucket_investment_pkey PRIMARY KEY (uid);

ALTER TABLE bucket_investment
  ADD CONSTRAINT buckets_uid_foreign FOREIGN KEY (uid) REFERENCES users(uid) ON UPDATE CASCADE ON DELETE CASCADE;
