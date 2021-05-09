--bucket_budget (up)

CREATE TYPE page_category AS ENUM ('income', 'bills', 'food', 'general', 'holiday', 'social');

CREATE TABLE buckets (
  id integer,
  uid integer NOT NULL,
  page page_category NOT NULL,
  filter_category text DEFAULT NULL,
  value integer NOT NULL
);

ALTER TABLE buckets
  ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);

CREATE SEQUENCE buckets_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

ALTER SEQUENCE buckets_id_seq OWNED BY buckets.id;
ALTER TABLE buckets ALTER COLUMN id SET DEFAULT nextval('buckets_id_seq'::regclass);

ALTER TABLE buckets
  ADD CONSTRAINT buckets_uid_foreign FOREIGN KEY (uid) REFERENCES users(uid) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE buckets
  ADD CONSTRAINT buckets_filter_unique UNIQUE (uid, page, filter_category);
