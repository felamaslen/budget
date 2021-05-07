--funds (up)

-- Main table
CREATE TABLE funds (
  item text NOT NULL,
  uid integer,
  id integer NOT NULL,
  allocation_target integer
);
ALTER TABLE funds
  ADD CONSTRAINT funds_pkey PRIMARY KEY (id);
ALTER TABLE funds
  ADD CONSTRAINT funds_uid_foreign FOREIGN KEY (uid) REFERENCES users(uid) ON UPDATE CASCADE ON DELETE CASCADE;
CREATE SEQUENCE funds_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER SEQUENCE funds_id_seq OWNED BY funds.id;
ALTER TABLE funds ALTER COLUMN id SET DEFAULT nextval('funds_id_seq'::regclass);

CREATE INDEX funds_uid_index ON funds USING btree (uid);

-- Transactions
CREATE TABLE funds_transactions (
  date date NOT NULL,
  units double precision NOT NULL,
  id integer NOT NULL,
  fund_id integer,
  price double precision DEFAULT '0'::double precision NOT NULL,
  fees integer DEFAULT 0 NOT NULL,
  taxes integer DEFAULT 0 NOT NULL,
  is_drip boolean DEFAULT false NOT NULL
);
ALTER TABLE funds_transactions
  ADD CONSTRAINT funds_transactions_pkey PRIMARY KEY (id);
ALTER TABLE funds_transactions
  ADD CONSTRAINT funds_transactions_fund_id_foreign FOREIGN KEY (fund_id) REFERENCES funds(id) ON UPDATE CASCADE ON DELETE CASCADE;
CREATE SEQUENCE funds_transactions_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER SEQUENCE funds_transactions_id_seq OWNED BY funds_transactions.id;
ALTER TABLE funds_transactions ALTER COLUMN id SET DEFAULT nextval('funds_transactions_id_seq'::regclass);

CREATE INDEX funds_transactions_fund_id_index ON funds_transactions USING btree (fund_id);

-- Stock splits
CREATE TABLE funds_stock_splits (
  id integer NOT NULL,
  fund_id integer,
  date date,
  ratio real
);
ALTER TABLE funds_stock_splits
  ADD CONSTRAINT funds_stock_splits_pkey PRIMARY KEY (id);
ALTER TABLE funds_stock_splits
  ADD CONSTRAINT funds_stock_splits_fund_id_foreign FOREIGN KEY (fund_id) REFERENCES funds(id) ON UPDATE CASCADE ON DELETE CASCADE;
CREATE SEQUENCE funds_stock_splits_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER SEQUENCE funds_stock_splits_id_seq OWNED BY funds_stock_splits.id;
ALTER TABLE funds_stock_splits ALTER COLUMN id SET DEFAULT nextval('funds_stock_splits_id_seq'::regclass);

-- Fund scrape (links funds to price cache tables)
CREATE TABLE fund_scrape (
  broker text NOT NULL,
  fid integer NOT NULL,
  item text NOT NULL
);
ALTER TABLE fund_scrape
  ADD CONSTRAINT fund_hash_pkey PRIMARY KEY (fid);
ALTER TABLE fund_scrape
    ADD CONSTRAINT fund_scrape_broker_item_unique UNIQUE (broker, item);
CREATE SEQUENCE fund_hash_fid_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER SEQUENCE fund_hash_fid_seq OWNED BY fund_scrape.fid;
ALTER TABLE fund_scrape ALTER COLUMN fid SET DEFAULT nextval('fund_hash_fid_seq'::regclass);

CREATE INDEX fund_scrape_item_index ON fund_scrape USING btree (item);

-- Fund cache time
CREATE TABLE fund_cache_time (
  "time" timestamp with time zone NOT NULL,
  cid integer NOT NULL
);
ALTER TABLE fund_cache_time
  ADD CONSTRAINT fund_cache_time_pkey PRIMARY KEY (cid);
CREATE INDEX fund_cache_time_time_index ON fund_cache_time USING btree ("time");
CREATE SEQUENCE fund_cache_time_cid_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER SEQUENCE fund_cache_time_cid_seq OWNED BY fund_cache_time.cid;
ALTER TABLE fund_cache_time ALTER COLUMN cid SET DEFAULT nextval('fund_cache_time_cid_seq'::regclass);

-- Fund cache
CREATE TABLE fund_cache (
  price double precision,
  id integer NOT NULL,
  fid integer,
  cid integer
);
ALTER TABLE fund_cache
  ADD CONSTRAINT fund_cache_pkey PRIMARY KEY (id);
ALTER TABLE fund_cache
  ADD CONSTRAINT fund_cache_cid_foreign FOREIGN KEY (cid) REFERENCES fund_cache_time(cid) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE fund_cache
  ADD CONSTRAINT fund_cache_fid_foreign FOREIGN KEY (fid) REFERENCES fund_scrape(fid) ON UPDATE CASCADE ON DELETE CASCADE;
CREATE SEQUENCE fund_cache_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER SEQUENCE fund_cache_id_seq OWNED BY fund_cache.id;
ALTER TABLE fund_cache ALTER COLUMN id SET DEFAULT nextval('fund_cache_id_seq'::regclass);

CREATE INDEX fund_cache_cid_index ON fund_cache USING btree (cid);
CREATE INDEX fund_cache_fid_index ON fund_cache USING btree (fid);

-- Cash target
CREATE TABLE funds_cash_target (
  uid integer NOT NULL,
  allocation_target integer
);
ALTER TABLE funds_cash_target
  ADD CONSTRAINT funds_cash_target_pkey PRIMARY KEY (uid);
ALTER TABLE funds_cash_target
  ADD CONSTRAINT funds_cash_target_uid_foreign FOREIGN KEY (uid) REFERENCES users(uid) ON UPDATE CASCADE ON DELETE CASCADE;
