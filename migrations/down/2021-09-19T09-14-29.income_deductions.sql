--income_deductions (down)

DROP INDEX list_income_partial_index;

DROP TABLE income_deductions;

DROP FUNCTION trf_insert_update_deduction;

DROP TRIGGER tr_update_list_income ON list_standard;
DROP FUNCTION trf_update_list_income;
