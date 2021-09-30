--financial_planning (up)

-- accounts table
CREATE TABLE planning_accounts (
  id integer NOT NULL,
  uid integer NOT NULL,
  account text NOT NULL,
  net_worth_subcategory_id integer NOT NULL
);

ALTER TABLE planning_accounts ADD CONSTRAINT planning_accounts_pkey PRIMARY KEY (id);

CREATE UNIQUE INDEX planning_accounts_account_unique ON planning_accounts (uid, account);
CREATE UNIQUE INDEX planning_accounts_subcategory_unique ON planning_accounts (net_worth_subcategory_id);

ALTER TABLE planning_accounts
  ADD CONSTRAINT planning_accounts_uid_fk FOREIGN KEY (uid) REFERENCES users(uid) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE planning_accounts
  ADD CONSTRAINT planning_accounts_net_worth_subcategories_fk FOREIGN KEY (net_worth_subcategory_id) REFERENCES net_worth_subcategories(id) ON UPDATE CASCADE ON DELETE CASCADE;

CREATE SEQUENCE planning_accounts_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER SEQUENCE planning_accounts_id_seq OWNED BY planning_accounts.id;
ALTER TABLE planning_accounts ALTER COLUMN id SET DEFAULT nextval('planning_accounts_id_seq'::regclass);

-- income table
CREATE TABLE planning_income (
  id integer NOT NULL,
  account_id integer NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  salary integer NOT NULL,
  tax_code text NOT NULL,
  pension_contrib float NOT NULL,
  student_loan boolean NOT NULL
);

ALTER TABLE planning_income ADD CONSTRAINT planning_income_pkey PRIMARY KEY (id);

ALTER TABLE planning_income
  ADD CONSTRAINT planning_income_account_id FOREIGN KEY (account_id) REFERENCES planning_accounts(id) ON UPDATE CASCADE ON DELETE CASCADE;

CREATE SEQUENCE planning_income_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER SEQUENCE planning_income_id_seq OWNED BY planning_income.id;
ALTER TABLE planning_income ALTER COLUMN id SET DEFAULT nextval('planning_income_id_seq'::regclass);

-- credit cards tables
CREATE TABLE planning_credit_cards (
  id integer NOT NULL,
  account_id integer NOT NULL,
  net_worth_subcategory_id integer NOT NULL
);

ALTER TABLE planning_credit_cards ADD CONSTRAINT planning_credit_cards_pkey PRIMARY KEY (id);
CREATE UNIQUE INDEX planning_credit_cards_unique ON planning_credit_cards (net_worth_subcategory_id);

ALTER TABLE planning_credit_cards
  ADD CONSTRAINT planning_credit_cards_account_id FOREIGN KEY (account_id) REFERENCES planning_accounts(id) ON UPDATE CASCADE ON DELETE CASCADE;

CREATE SEQUENCE planning_credit_cards_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER SEQUENCE planning_credit_cards_id_seq OWNED BY planning_credit_cards.id;
ALTER TABLE planning_credit_cards ALTER COLUMN id SET DEFAULT nextval('planning_credit_cards_id_seq'::regclass);

CREATE TABLE planning_credit_card_payments (
  id integer NOT NULL,
  credit_card_id integer NOT NULL,
  year integer NOT NULL,
  month integer NOT NULL,
  value integer NOT NULL
);

ALTER TABLE planning_credit_card_payments ADD CONSTRAINT planning_credit_card_payments_pkey PRIMARY KEY (id);

ALTER TABLE planning_credit_card_payments
  ADD CONSTRAINT planning_credit_card_payments_credit_card_id FOREIGN KEY (credit_card_id) REFERENCES planning_credit_cards(id) ON UPDATE CASCADE ON DELETE CASCADE;

CREATE SEQUENCE planning_credit_card_payments_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER SEQUENCE planning_credit_card_payments_id_seq OWNED BY planning_credit_card_payments.id;
ALTER TABLE planning_credit_card_payments ALTER COLUMN id SET DEFAULT nextval('planning_credit_card_payments_id_seq'::regclass);

CREATE UNIQUE INDEX planning_credit_card_payments_unique ON planning_credit_card_payments (credit_card_id, year, month);

-- thresholds table
CREATE TABLE planning_thresholds (
  id integer NOT NULL,
  uid integer NOT NULL,
  year integer NOT NULL,
  name text NOT NULL,
  value integer NOT NULL
);

ALTER TABLE planning_thresholds ADD CONSTRAINT planning_thresholds_pkey PRIMARY KEY (id);

CREATE SEQUENCE planning_thresholds_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER SEQUENCE planning_thresholds_id_seq OWNED BY planning_thresholds.id;
ALTER TABLE planning_thresholds ALTER COLUMN id SET DEFAULT nextval('planning_thresholds_id_seq'::regclass);

ALTER TABLE planning_thresholds
  ADD CONSTRAINT planning_thresholds_uid_fk FOREIGN KEY (uid) REFERENCES users(uid) ON UPDATE CASCADE ON DELETE CASCADE;

CREATE UNIQUE INDEX planning_thresholds_unique ON planning_thresholds(uid, year, name);

-- rates table
CREATE TABLE planning_rates (
  id integer NOT NULL,
  uid integer NOT NULL,
  year integer NOT NULL,
  name text NOT NULL,
  value float NOT NULL
);

ALTER TABLE planning_rates ADD CONSTRAINT planning_rates_pkey PRIMARY KEY (id);

CREATE SEQUENCE planning_rates_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER SEQUENCE planning_rates_id_seq OWNED BY planning_rates.id;
ALTER TABLE planning_rates ALTER COLUMN id SET DEFAULT nextval('planning_rates_id_seq'::regclass);

ALTER TABLE planning_rates
  ADD CONSTRAINT planning_rates_uid_fk FOREIGN KEY (uid) REFERENCES users(uid) ON UPDATE CASCADE ON DELETE CASCADE;

CREATE UNIQUE INDEX planning_rates_unique ON planning_rates(uid, year, name);

-- values table
CREATE TABLE planning_values (
  id integer NOT NULL,
  year integer NOT NULL,
  month integer NOT NULL,
  account_id integer NOT NULL,
  name text NOT NULL,
  value integer DEFAULT NULL,
  formula text DEFAULT NULL,
  transfer_to integer DEFAULT NULL
);

ALTER TABLE planning_values ADD CONSTRAINT planning_values_has_value CHECK (
  (value IS NULL) != (formula IS NULL)
);

ALTER TABLE planning_values ADD CONSTRAINT planning_values_pkey PRIMARY KEY (id);

CREATE UNIQUE INDEX planning_values_name_unique ON planning_values (year, month, account_id, name);

CREATE SEQUENCE planning_values_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER SEQUENCE planning_values_id_seq OWNED BY planning_values.id;
ALTER TABLE planning_values ALTER COLUMN id SET DEFAULT nextval('planning_values_id_seq'::regclass);

ALTER TABLE planning_values
  ADD CONSTRAINT planning_values_account_foreign FOREIGN KEY (account_id) REFERENCES planning_accounts(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE planning_values
  ADD CONSTRAINT planning_values_transfer_to_foreign FOREIGN KEY (transfer_to) REFERENCES planning_accounts(id) ON UPDATE CASCADE ON DELETE SET NULL;

CREATE INDEX planning_values_date_index ON planning_values USING btree(year, month);
