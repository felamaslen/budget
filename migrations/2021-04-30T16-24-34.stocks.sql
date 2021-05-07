--stocks (up)

CREATE TABLE stock_codes (
  name text NOT NULL,
  code text,
  id integer NOT NULL
);
ALTER TABLE stock_codes
  ADD CONSTRAINT stock_codes_pkey PRIMARY KEY (id);
CREATE SEQUENCE stock_codes_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER SEQUENCE stock_codes_id_seq OWNED BY stock_codes.id;
ALTER TABLE stock_codes ALTER COLUMN id SET DEFAULT nextval('stock_codes_id_seq'::regclass);

ALTER TABLE stock_codes
  ADD CONSTRAINT stock_codes_name_code_unique UNIQUE (name, code);

CREATE TABLE stocks (
  name text NOT NULL,
  code text,
  weight real,
  subweight real,
  uid integer,
  id integer NOT NULL
);
ALTER TABLE stocks
  ADD CONSTRAINT stocks_pkey PRIMARY KEY (id);
ALTER TABLE stocks
    ADD CONSTRAINT stocks_uid_foreign FOREIGN KEY (uid) REFERENCES users(uid) ON UPDATE CASCADE ON DELETE CASCADE;
CREATE SEQUENCE stocks_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER SEQUENCE stocks_id_seq OWNED BY stocks.id;
ALTER TABLE stocks ALTER COLUMN id SET DEFAULT nextval('stocks_id_seq'::regclass);

CREATE INDEX stocks_uid_index ON stocks USING btree (uid);
