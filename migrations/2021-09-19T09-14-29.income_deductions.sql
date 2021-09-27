--income_deductions (up)

CREATE TABLE income_deductions (
  id integer NOT NULL,
  list_id integer NOT NULL,
  name text NOT NULL,
  value integer NOT NULL
);

CREATE SEQUENCE income_deductions_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;
ALTER SEQUENCE income_deductions_id_seq OWNED BY income_deductions.id;
ALTER TABLE income_deductions ALTER COLUMN id SET DEFAULT nextval('income_deductions_id_seq'::regclass);

CREATE UNIQUE INDEX income_deduction_unique ON income_deductions(list_id, name);

ALTER TABLE income_deductions
  ADD CONSTRAINT income_deductions_list_id_foreign FOREIGN KEY (list_id) REFERENCES list_standard(id) ON UPDATE CASCADE ON DELETE CASCADE;

CREATE INDEX income_deductions_list_id_index ON income_deductions USING btree (list_id);

CREATE FUNCTION trf_insert_update_deduction() RETURNS trigger AS $$
BEGIN
  PERFORM * FROM list_standard WHERE id = NEW.list_id AND page = 'income'::page_category;
  IF NOT FOUND THEN
    RAISE NOTICE 'Foreign key violation; only income rows may have deductions';
    RETURN NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_insert_update_deduction
BEFORE INSERT OR UPDATE ON income_deductions
FOR EACH ROW EXECUTE PROCEDURE trf_insert_update_deduction();

CREATE UNIQUE INDEX list_income_partial_index ON list_standard(id) WHERE page = 'income'::page_category;

CREATE FUNCTION trf_update_list_income() RETURNS trigger AS $$
BEGIN
  IF NEW.page != 'income'::page_category THEN
    DELETE FROM income_deductions WHERE list_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_list_income
BEFORE UPDATE ON list_standard
FOR EACH ROW EXECUTE PROCEDURE trf_update_list_income();
