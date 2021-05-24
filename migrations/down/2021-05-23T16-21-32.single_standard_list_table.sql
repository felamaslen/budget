--single_standard_list_table (down)

-- restore data

DELETE FROM income;
DELETE FROM bills;
DELETE FROM food;
DELETE FROM general;
DELETE FROM social;
DELETE FROM holiday;

INSERT INTO income (uid, date, item, category, cost, shop)
SELECT uid, date, item, category, value AS cost, shop FROM list_standard WHERE page = 'income';

INSERT INTO bills (uid, date, item, category, cost, shop)
SELECT uid, date, item, category, value AS cost, shop FROM list_standard WHERE page = 'bills';

INSERT INTO food (uid, date, item, category, cost, shop)
SELECT uid, date, item, category, value AS cost, shop FROM list_standard WHERE page = 'food';

INSERT INTO general (uid, date, item, category, cost, shop)
SELECT uid, date, item, category, value AS cost, shop FROM list_standard WHERE page = 'general';

INSERT INTO social (uid, date, item, category, cost, shop)
SELECT uid, date, item, category, value AS cost, shop FROM list_standard WHERE page = 'social';

INSERT INTO holiday (uid, date, item, category, cost, shop)
SELECT uid, date, item, category, value AS cost, shop FROM list_standard WHERE page = 'holiday';

DROP TABLE list_standard;
