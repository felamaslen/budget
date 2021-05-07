--net_worth (up)

CREATE TABLE net_worth_categories (
  type text NOT NULL,
  category text,
  color text,
  is_option boolean DEFAULT false,
  id integer NOT NULL,
  uid integer,
  CONSTRAINT net_worth_categories_type_check CHECK ((type = ANY (ARRAY['asset'::text, 'liability'::text])))
);
ALTER TABLE net_worth_categories
  ADD CONSTRAINT net_worth_categories_pkey PRIMARY KEY (id);
ALTER TABLE net_worth_categories
  ADD CONSTRAINT net_worth_categories_uid_foreign FOREIGN KEY (uid) REFERENCES users(uid) ON UPDATE CASCADE ON DELETE CASCADE;
CREATE SEQUENCE net_worth_categories_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER SEQUENCE net_worth_categories_id_seq OWNED BY net_worth_categories.id;
ALTER TABLE net_worth_categories ALTER COLUMN id SET DEFAULT nextval('net_worth_categories_id_seq'::regclass);

CREATE INDEX net_worth_categories_type_category_index ON net_worth_categories USING btree (type, category);

CREATE TABLE net_worth_subcategories (
  subcategory text,
  has_credit_limit boolean,
  opacity real DEFAULT '0'::real,
  category_id integer NOT NULL,
  id integer NOT NULL,
  is_saye boolean,
  appreciation_rate real
);
ALTER TABLE net_worth_subcategories
  ADD CONSTRAINT net_worth_subcategories_pkey PRIMARY KEY (id);
ALTER TABLE net_worth_subcategories
  ADD CONSTRAINT net_worth_subcategories_category_id_foreign FOREIGN KEY (category_id) REFERENCES net_worth_categories(id) ON UPDATE CASCADE ON DELETE CASCADE;
CREATE SEQUENCE net_worth_subcategories_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER SEQUENCE net_worth_subcategories_id_seq OWNED BY net_worth_subcategories.id;
ALTER TABLE net_worth_subcategories ALTER COLUMN id SET DEFAULT nextval('net_worth_subcategories_id_seq'::regclass);

CREATE INDEX net_worth_subcategories_category_id_index ON net_worth_subcategories USING btree (category_id);

CREATE TABLE net_worth (
  date date NOT NULL,
  uid integer,
  id integer NOT NULL
);
ALTER TABLE net_worth
  ADD CONSTRAINT net_worth_pkey PRIMARY KEY (id);
ALTER TABLE net_worth
  ADD CONSTRAINT net_worth_uid_foreign FOREIGN KEY (uid) REFERENCES users(uid) ON UPDATE CASCADE ON DELETE CASCADE;
CREATE SEQUENCE net_worth_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER SEQUENCE net_worth_id_seq OWNED BY net_worth.id;
ALTER TABLE net_worth ALTER COLUMN id SET DEFAULT nextval('net_worth_id_seq'::regclass);

CREATE INDEX net_worth_uid_index ON net_worth USING btree (uid);
CREATE INDEX net_worth_date_index ON net_worth USING btree (date);

CREATE TABLE net_worth_credit_limit (
  value integer NOT NULL,
  subcategory integer,
  net_worth_id integer
);
ALTER TABLE net_worth_credit_limit
  ADD CONSTRAINT net_worth_credit_limit_net_worth_id_foreign FOREIGN KEY (net_worth_id) REFERENCES net_worth(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE net_worth_credit_limit
  ADD CONSTRAINT net_worth_credit_limit_subcategory_foreign FOREIGN KEY (subcategory) REFERENCES net_worth_subcategories(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE net_worth_credit_limit
  ADD CONSTRAINT net_worth_credit_limit_net_worth_id_subcategory_unique UNIQUE (net_worth_id, subcategory);

CREATE INDEX net_worth_credit_limit_net_worth_id_index ON net_worth_credit_limit USING btree (net_worth_id);
CREATE INDEX net_worth_credit_limit_subcategory_index ON net_worth_credit_limit USING btree (subcategory);

CREATE TABLE net_worth_currencies (
  currency text,
  rate double precision,
  net_worth_id integer,
  id integer NOT NULL
);
ALTER TABLE net_worth_currencies
  ADD CONSTRAINT net_worth_currencies_pkey PRIMARY KEY (id);
ALTER TABLE net_worth_currencies
  ADD CONSTRAINT net_worth_currencies_net_worth_id_foreign FOREIGN KEY (net_worth_id) REFERENCES net_worth(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE net_worth_currencies
  ADD CONSTRAINT net_worth_currencies_net_worth_id_currency_unique UNIQUE (net_worth_id, currency);
CREATE SEQUENCE net_worth_currencies_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER SEQUENCE net_worth_currencies_id_seq OWNED BY net_worth_currencies.id;
ALTER TABLE net_worth_currencies ALTER COLUMN id SET DEFAULT nextval('net_worth_currencies_id_seq'::regclass);

CREATE INDEX net_worth_currencies_net_worth_id_index ON net_worth_currencies USING btree (net_worth_id);

CREATE TABLE net_worth_values (
  value integer,
  skip boolean,
  subcategory integer,
  net_worth_id integer,
  id integer NOT NULL
);
ALTER TABLE net_worth_values
  ADD CONSTRAINT net_worth_values_pkey PRIMARY KEY (id);
ALTER TABLE net_worth_values
  ADD CONSTRAINT net_worth_values_net_worth_id_foreign FOREIGN KEY (net_worth_id) REFERENCES net_worth(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE net_worth_values
  ADD CONSTRAINT net_worth_values_subcategory_foreign FOREIGN KEY (subcategory) REFERENCES net_worth_subcategories(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE net_worth_values
  ADD CONSTRAINT net_worth_values_net_worth_id_subcategory_unique UNIQUE (net_worth_id, subcategory);
CREATE SEQUENCE net_worth_values_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER SEQUENCE net_worth_values_id_seq OWNED BY net_worth_values.id;
ALTER TABLE net_worth_values ALTER COLUMN id SET DEFAULT nextval('net_worth_values_id_seq'::regclass);

CREATE INDEX net_worth_values_net_worth_id_index ON net_worth_values USING btree (net_worth_id);
CREATE INDEX net_worth_values_subcategory_index ON net_worth_values USING btree (subcategory);

CREATE TABLE net_worth_fx_values (
  value real,
  currency text,
  values_id integer,
  id integer NOT NULL
);
ALTER TABLE net_worth_fx_values
  ADD CONSTRAINT net_worth_fx_values_pkey PRIMARY KEY (id);
ALTER TABLE net_worth_fx_values
  ADD CONSTRAINT net_worth_fx_values_values_id_foreign FOREIGN KEY (values_id) REFERENCES net_worth_values(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE net_worth_fx_values
  ADD CONSTRAINT net_worth_fx_values_values_id_currency_unique UNIQUE (values_id, currency);
CREATE SEQUENCE net_worth_fx_values_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER SEQUENCE net_worth_fx_values_id_seq OWNED BY net_worth_fx_values.id;
ALTER TABLE net_worth_fx_values ALTER COLUMN id SET DEFAULT nextval('net_worth_fx_values_id_seq'::regclass);

CREATE INDEX net_worth_fx_values_values_id_index ON net_worth_fx_values USING btree (values_id);

CREATE TABLE net_worth_loan_values (
  values_id integer NOT NULL,
  payments_remaining integer NOT NULL,
  rate real NOT NULL
);
ALTER TABLE net_worth_loan_values
  ADD CONSTRAINT net_worth_loan_values_pkey PRIMARY KEY (values_id);
ALTER TABLE net_worth_loan_values
  ADD CONSTRAINT net_worth_loan_values_values_id_foreign FOREIGN KEY (values_id) REFERENCES net_worth_values(id) ON UPDATE CASCADE ON DELETE CASCADE;

CREATE TABLE net_worth_option_values (
  units real,
  strike_price real,
  market_price real,
  values_id integer,
  id integer NOT NULL,
  vested integer DEFAULT 0 NOT NULL
);
ALTER TABLE net_worth_option_values
  ADD CONSTRAINT net_worth_option_values_pkey PRIMARY KEY (id);
ALTER TABLE net_worth_option_values
  ADD CONSTRAINT net_worth_option_values_values_id_foreign FOREIGN KEY (values_id) REFERENCES net_worth_values(id) ON UPDATE CASCADE ON DELETE CASCADE;
CREATE SEQUENCE net_worth_option_values_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER SEQUENCE net_worth_option_values_id_seq OWNED BY net_worth_option_values.id;
ALTER TABLE net_worth_option_values ALTER COLUMN id SET DEFAULT nextval('net_worth_option_values_id_seq'::regclass);

CREATE INDEX net_worth_option_values_values_id_index ON net_worth_option_values USING btree (values_id);
