--funds_units_rebased (up)

BEGIN;

ALTER TABLE funds_transactions
ADD COLUMN units_split_adj double precision DEFAULT '0'::double precision NOT NULL
,ADD COLUMN price_split_adj double precision DEFAULT '0'::double precision NOT NULL
;

ALTER TABLE fund_cache
ADD COLUMN price_split_adj double precision;

CREATE FUNCTION update_split_adj()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  UPDATE funds_transactions ft
  SET
    units_split_adj = r.units_split_adj
    ,price_split_adj = r.price_split_adj
  FROM (
    SELECT 
      ft.id
      ,ft.units * round(exp(sum(ln(coalesce(fss.ratio, 1))))) AS units_split_adj
      ,ft.price / round(exp(sum(ln(coalesce(fss.ratio, 1))))) AS price_split_adj
    FROM funds f
    LEFT JOIN funds_transactions ft ON ft.fund_id = f.id
    LEFT JOIN funds_stock_splits fss ON fss.fund_id = f.id AND fss.date > ft.date
    GROUP BY ft.id, ft.units, ft.price
  ) r
  WHERE ft.id = r.id
  ;

  UPDATE fund_cache fc
  SET price_split_adj = r.price_split_adj
  FROM (
    SELECT
      fc.id
      ,fc.price / round(exp(sum(ln(coalesce(fss.ratio, 1))))) AS price_split_adj
    FROM fund_cache fc
    INNER JOIN fund_cache_time fct ON fct.cid = fc.cid
    INNER JOIN fund_scrape fs ON fs.fid = fc.fid
    LEFT JOIN funds f ON f.item = fs.item
    LEFT JOIN funds_stock_splits fss ON fss.fund_id = f.id AND fss.date > fct.time
    GROUP BY fc.id, fc.price
  ) r
  WHERE fc.id = r.id
  ;

  RETURN NULL;
END
$$
;

CREATE TRIGGER funds_stock_splits_adjust
AFTER INSERT OR UPDATE OR DELETE ON funds_stock_splits
FOR EACH STATEMENT
  EXECUTE PROCEDURE update_split_adj()
;

CREATE FUNCTION set_fund_cache_price_split_adj()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  UPDATE fund_cache
  SET price_split_adj = price
  WHERE id = NEW.id;

  RETURN NEW;
END
$$
;

CREATE TRIGGER funds_cache_insert_adjust
AFTER INSERT ON fund_cache
FOR EACH ROW
  EXECUTE PROCEDURE set_fund_cache_price_split_adj()
;

CREATE FUNCTION insert_transaction_split_adj()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  UPDATE funds_transactions ft
  SET
    units_split_adj = r.units_split_adj
    ,price_split_adj = r.price_split_adj
  FROM (
    SELECT 
      ft.id
      ,ft.units * round(exp(sum(ln(coalesce(fss.ratio, 1))))) AS units_split_adj
      ,ft.price / round(exp(sum(ln(coalesce(fss.ratio, 1))))) AS price_split_adj
    FROM funds_transactions ft
    INNER JOIN funds f ON f.id = ft.fund_id
    LEFT JOIN funds_stock_splits fss ON fss.fund_id = f.id AND fss.date > ft.date
    WHERE ft.id = NEW.id
    GROUP BY ft.id, ft.units, ft.price
  ) r
  WHERE ft.id = NEW.id AND r.id = ft.id
  ;

  RETURN NEW;
END
$$
;

CREATE FUNCTION update_transaction_split_adj()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  IF NEW.date <> OLD.date OR NEW.units <> OLD.units OR NEW.price <> OLD.price THEN
    UPDATE funds_transactions ft
    SET
      units_split_adj = r.units_split_adj
      ,price_split_adj = r.price_split_adj
    FROM (
      SELECT 
        ft.id
        ,ft.units * round(exp(sum(ln(coalesce(fss.ratio, 1))))) AS units_split_adj
        ,ft.price / round(exp(sum(ln(coalesce(fss.ratio, 1))))) AS price_split_adj
      FROM funds_transactions ft
      INNER JOIN funds f ON f.id = ft.fund_id
      LEFT JOIN funds_stock_splits fss ON fss.fund_id = f.id AND fss.date > ft.date
      WHERE ft.id = NEW.id
      GROUP BY ft.id, ft.units, ft.price
    ) r
    WHERE ft.id = NEW.id AND r.id = ft.id
    ;
  END IF;

  RETURN NEW;
END
$$
;

CREATE TRIGGER funds_transactions_insert_adjust
AFTER INSERT ON funds_transactions
FOR EACH ROW
  EXECUTE PROCEDURE insert_transaction_split_adj()
;

CREATE TRIGGER funds_transactions_update_adjust
AFTER UPDATE ON funds_transactions
FOR EACH ROW
  EXECUTE PROCEDURE update_transaction_split_adj()
;

UPDATE funds_stock_splits SET id = id;

COMMIT;
