--single_standard_list_table (up)

CREATE TABLE list_standard (
  id integer NOT NULL,
  page page_category NOT NULL,
  uid integer,
  date date NOT NULL,
  item text NOT NULL,
  item_search tsvector,
  category text NOT NULL,
  category_search tsvector,
  shop text NOT NULL,
  shop_search tsvector,
  value integer NOT NULL
);

ALTER TABLE list_standard
  ADD CONSTRAINT list_standard_pkey
  PRIMARY KEY (id);

CREATE SEQUENCE list_standard_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER SEQUENCE list_standard_id_seq OWNED BY list_standard.id;
ALTER TABLE list_standard ALTER COLUMN id SET DEFAULT nextval('list_standard_id_seq'::regclass);

ALTER TABLE list_standard
  ADD CONSTRAINT list_standard_uid_foreign
  FOREIGN KEY (uid)
  REFERENCES users(uid) ON UPDATE CASCADE ON DELETE CASCADE;

CREATE INDEX list_standard_uid_index ON list_standard USING btree (uid);
CREATE INDEX list_standard_page_index ON list_standard USING btree(page);
CREATE INDEX list_standard_date_index ON list_standard USING btree (date);
CREATE INDEX list_standard_category_index ON list_standard USING btree(category);
CREATE INDEX list_standard_shop_index ON list_standard USING btree(shop);

CREATE TRIGGER list_standard_vector_update_item BEFORE INSERT OR UPDATE ON list_standard
  FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger('item_search', 'pg_catalog.english', 'item');

CREATE TRIGGER list_standard_vector_update_category BEFORE INSERT OR UPDATE ON list_standard
  FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger('category_search', 'pg_catalog.english', 'category');

CREATE TRIGGER list_standard_vector_update_shop BEFORE INSERT OR UPDATE ON list_standard
  FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger('shop_search', 'pg_catalog.english', 'shop');

-- convert data

INSERT INTO list_standard (page, uid, date, item, category, shop, value)
SELECT 'income'::page_category AS page, uid, date, item, category, shop, cost AS value FROM income
UNION ALL
SELECT 'bills'::page_category AS page, uid, date, item, category, shop, cost AS value FROM bills
UNION ALL
SELECT 'food'::page_category AS page, uid, date, item, category, shop, cost AS value FROM food
UNION ALL
SELECT 'general'::page_category AS page, uid, date, item, category, shop, cost AS value FROM general
UNION ALL
SELECT 'social'::page_category AS page, uid, date, item, category, shop, cost AS value FROM social
UNION ALL
SELECT 'holiday'::page_category AS page, uid, date, item, category, shop, cost AS value FROM holiday
;
