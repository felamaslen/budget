--drop_list_tables (down)

-- Tables
CREATE TABLE income (
  date date NOT NULL,
  item text NOT NULL,
  cost integer NOT NULL,
  item_search tsvector,
  uid integer,
  id integer NOT NULL,
  category text NOT NULL,
  shop text NOT NULL,
  category_search tsvector,
  shop_search tsvector
);
CREATE TABLE bills (
  date date NOT NULL,
  item text NOT NULL,
  cost integer NOT NULL,
  item_search tsvector,
  uid integer,
  id integer NOT NULL,
  category text NOT NULL,
  shop text NOT NULL,
  category_search tsvector,
  shop_search tsvector
);
CREATE TABLE food (
  date date NOT NULL,
  item text NOT NULL,
  cost integer NOT NULL,
  category text NOT NULL,
  shop text NOT NULL,
  item_search tsvector,
  category_search tsvector,
  shop_search tsvector,
  uid integer,
  id integer NOT NULL
);
CREATE TABLE general (
  date date NOT NULL,
  item text NOT NULL,
  cost integer NOT NULL,
  category text NOT NULL,
  shop text NOT NULL,
  item_search tsvector,
  category_search tsvector,
  shop_search tsvector,
  uid integer,
  id integer NOT NULL
);
CREATE TABLE social (
  date date NOT NULL,
  item text NOT NULL,
  cost integer NOT NULL,
  category text NOT NULL,
  shop text NOT NULL,
  item_search tsvector,
  shop_search tsvector,
  uid integer,
  id integer NOT NULL,
  category_search tsvector
);
CREATE TABLE holiday (
  date date NOT NULL,
  item text NOT NULL,
  cost integer NOT NULL,
  category text NOT NULL,
  shop text NOT NULL,
  item_search tsvector,
  shop_search tsvector,
  uid integer,
  id integer NOT NULL,
  category_search tsvector
);

-- Primary keys
ALTER TABLE income
  ADD CONSTRAINT income_pkey PRIMARY KEY (id);
ALTER TABLE bills
  ADD CONSTRAINT bills_pkey PRIMARY KEY (id);
ALTER TABLE food
  ADD CONSTRAINT food_pkey PRIMARY KEY (id);
ALTER TABLE general
  ADD CONSTRAINT general_pkey PRIMARY KEY (id);
ALTER TABLE social
  ADD CONSTRAINT social_pkey PRIMARY KEY (id);
ALTER TABLE holiday
  ADD CONSTRAINT holiday_pkey PRIMARY KEY (id);

-- uid FKs
ALTER TABLE income
  ADD CONSTRAINT income_uid_foreign FOREIGN KEY (uid) REFERENCES users(uid) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE bills
  ADD CONSTRAINT bills_uid_foreign FOREIGN KEY (uid) REFERENCES users(uid) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE food
  ADD CONSTRAINT food_uid_foreign FOREIGN KEY (uid) REFERENCES users(uid) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE general
  ADD CONSTRAINT general_uid_foreign FOREIGN KEY (uid) REFERENCES users(uid) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE social
  ADD CONSTRAINT social_uid_foreign FOREIGN KEY (uid) REFERENCES users(uid) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE holiday
  ADD CONSTRAINT holiday_uid_foreign FOREIGN KEY (uid) REFERENCES users(uid) ON UPDATE CASCADE ON DELETE CASCADE;

-- PK sequences
CREATE SEQUENCE income_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER SEQUENCE income_id_seq OWNED BY income.id;
ALTER TABLE income ALTER COLUMN id SET DEFAULT nextval('income_id_seq'::regclass);

CREATE SEQUENCE bills_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER SEQUENCE bills_id_seq OWNED BY bills.id;
ALTER TABLE bills ALTER COLUMN id SET DEFAULT nextval('bills_id_seq'::regclass);

CREATE SEQUENCE food_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER SEQUENCE food_id_seq OWNED BY food.id;
ALTER TABLE food ALTER COLUMN id SET DEFAULT nextval('food_id_seq'::regclass);

CREATE SEQUENCE general_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER SEQUENCE general_id_seq OWNED BY general.id;
ALTER TABLE general ALTER COLUMN id SET DEFAULT nextval('general_id_seq'::regclass);

CREATE SEQUENCE social_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER SEQUENCE social_id_seq OWNED BY social.id;
ALTER TABLE social ALTER COLUMN id SET DEFAULT nextval('social_id_seq'::regclass);

CREATE SEQUENCE holiday_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER SEQUENCE holiday_id_seq OWNED BY holiday.id;
ALTER TABLE holiday ALTER COLUMN id SET DEFAULT nextval('holiday_id_seq'::regclass);

-- Search indexes
-- index: income
CREATE INDEX income_uid_index ON income USING btree (uid);
CREATE INDEX income_date_index ON income USING btree (date);
CREATE INDEX income_category_index ON income USING btree (category);
CREATE INDEX income_shop_index ON income USING btree (shop);

CREATE INDEX income_item_search ON income USING gin (item_search);
CREATE INDEX income_category_search ON income USING gin (category_search);
CREATE INDEX income_shop_search ON income USING gin (shop_search);

CREATE TRIGGER income_vector_update_item BEFORE INSERT OR UPDATE ON income FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger('item_search', 'pg_catalog.english', 'item');
CREATE TRIGGER income_vector_update_category BEFORE INSERT OR UPDATE ON income FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger('category_search', 'pg_catalog.english', 'category');
CREATE TRIGGER income_vector_update_shop BEFORE INSERT OR UPDATE ON income FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger('shop_search', 'pg_catalog.english', 'shop');

-- index: bills
CREATE INDEX bills_uid_index ON bills USING btree (uid);
CREATE INDEX bills_date_index ON bills USING btree (date);
CREATE INDEX bills_category_index ON bills USING btree (category);
CREATE INDEX bills_shop_index ON bills USING btree (shop);

CREATE INDEX bills_item_search ON bills USING gin (item_search);
CREATE INDEX bills_category_search ON bills USING gin (category_search);
CREATE INDEX bills_shop_search ON bills USING gin (shop_search);

CREATE TRIGGER bills_vector_update_item BEFORE INSERT OR UPDATE ON bills FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger('item_search', 'pg_catalog.english', 'item');
CREATE TRIGGER bills_vector_update_category BEFORE INSERT OR UPDATE ON bills FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger('category_search', 'pg_catalog.english', 'category');
CREATE TRIGGER bills_vector_update_shop BEFORE INSERT OR UPDATE ON bills FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger('shop_search', 'pg_catalog.english', 'shop');

-- index: food
CREATE INDEX food_uid_index ON food USING btree (uid);
CREATE INDEX food_date_index ON food USING btree (date);
CREATE INDEX food_category_index ON food USING btree (category);
CREATE INDEX food_shop_index ON food USING btree (shop);

CREATE INDEX food_item_search ON food USING gin (item_search);
CREATE INDEX food_category_search ON food USING gin (category_search);
CREATE INDEX food_shop_search ON food USING gin (shop_search);

CREATE TRIGGER food_vector_update_item BEFORE INSERT OR UPDATE ON food FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger('item_search', 'pg_catalog.english', 'item');
CREATE TRIGGER food_vector_update_category BEFORE INSERT OR UPDATE ON food FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger('category_search', 'pg_catalog.english', 'category');
CREATE TRIGGER food_vector_update_shop BEFORE INSERT OR UPDATE ON food FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger('shop_search', 'pg_catalog.english', 'shop');

-- index: general
CREATE INDEX general_uid_index ON general USING btree (uid);
CREATE INDEX general_date_index ON general USING btree (date);
CREATE INDEX general_category_index ON general USING btree (category);
CREATE INDEX general_shop_index ON general USING btree (shop);

CREATE INDEX general_item_search ON general USING gin (item_search);
CREATE INDEX general_category_search ON general USING gin (category_search);
CREATE INDEX general_shop_search ON general USING gin (shop_search);

CREATE TRIGGER general_vector_update_item BEFORE INSERT OR UPDATE ON general FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger('item_search', 'pg_catalog.english', 'item');
CREATE TRIGGER general_vector_update_category BEFORE INSERT OR UPDATE ON general FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger('category_search', 'pg_catalog.english', 'category');
CREATE TRIGGER general_vector_update_shop BEFORE INSERT OR UPDATE ON general FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger('shop_search', 'pg_catalog.english', 'shop');

-- index: social
CREATE INDEX social_uid_index ON social USING btree (uid);
CREATE INDEX social_date_index ON social USING btree (date);
CREATE INDEX social_category_index ON social USING btree (category);
CREATE INDEX social_shop_index ON social USING btree (shop);

CREATE INDEX social_item_search ON social USING gin (item_search);
CREATE INDEX social_category_search ON social USING gin (category_search);
CREATE INDEX social_shop_search ON social USING gin (shop_search);

CREATE TRIGGER social_vector_update_item BEFORE INSERT OR UPDATE ON social FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger('item_search', 'pg_catalog.english', 'item');
CREATE TRIGGER social_vector_update_category BEFORE INSERT OR UPDATE ON social FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger('category_search', 'pg_catalog.english', 'category');
CREATE TRIGGER social_vector_update_shop BEFORE INSERT OR UPDATE ON social FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger('shop_search', 'pg_catalog.english', 'shop');

-- index: holiday
CREATE INDEX holiday_uid_index ON holiday USING btree (uid);
CREATE INDEX holiday_date_index ON holiday USING btree (date);
CREATE INDEX holiday_category_index ON holiday USING btree (category);
CREATE INDEX holiday_shop_index ON holiday USING btree (shop);

CREATE INDEX holiday_item_search ON holiday USING gin (item_search);
CREATE INDEX holiday_category_search ON holiday USING gin (category_search);
CREATE INDEX holiday_shop_search ON holiday USING gin (shop_search);

CREATE TRIGGER holiday_vector_update_item BEFORE INSERT OR UPDATE ON holiday FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger('item_search', 'pg_catalog.english', 'item');
CREATE TRIGGER holiday_vector_update_category BEFORE INSERT OR UPDATE ON holiday FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger('category_search', 'pg_catalog.english', 'category');
CREATE TRIGGER holiday_vector_update_shop BEFORE INSERT OR UPDATE ON holiday FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger('shop_search', 'pg_catalog.english', 'shop');
