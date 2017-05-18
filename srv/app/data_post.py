""" Methods to put or edit data in the database """

import json

from app.api_data_methods import Processor

from app.misc import strng, list_data_schema, get_table_total, \
        deserialise_date, deserialise_transactions
from app.config import LIST_CATEGORIES, E_BAD_PARAMS, \
        E_BAD_FORM, E_NO_FORM, E_NO_ITEM

class UpdateData(Processor):
    """ general class to update data in database """
    def __init__(self, db, uid, form, schema, all_required=False, table=None):
        super(UpdateData, self).__init__(db, uid, form=form)

        self.form_raw = form
        self.all_required = all_required

        self.table = table

        form_valid = False

        try:
            form_valid = self.validate_form(schema)

            if form_valid is False:
                self.error = True
                self.error_text = E_BAD_FORM

        except ValueError as param_error:
            self.error = True
            self.error_text = str(param_error)

    def set_value_from_raw(self, key, raw_value, data_type):
        """ sets individual form items after validating them """
        value = None

        if raw_value is None:
            raise ValueError("Form data for %s is null" % key)

        if data_type == 'date':
            value = deserialise_date(raw_value)

            self.form['year'] = value[0]
            self.form['month'] = value[1]
            self.form['date'] = value[2]

        elif data_type == 'transactions':
            try:
                value = deserialise_transactions(raw_value)
                self.form[key] = json.dumps(value, separators=(',', ':'))
            except ValueError:
                return False

        else:
            if data_type == 'int':
                try:
                    value = int(raw_value)
                except ValueError:
                    return False

            elif data_type == 'float':
                try:
                    value = float(raw_value)
                except ValueError:
                    return False

            elif data_type == 'string':
                try:
                    value = strng(raw_value)
                except:
                    raise ValueError("Error with text value for %s" % key)

            if value is None:
                return False

            self.form[key] = value

        return True

    def validate_form(self, schema):
        """ validate form entries according to schema """
        self.form = {}

        optional_count = 0

        has_optional = False

        for (key, (data_type, optional)) in schema.items():
            if not has_optional and optional:
                has_optional = True

            if key not in self.form_raw:
                if optional and not self.all_required:
                    continue
                else:
                    raise ValueError("Form data for %s not supplied" % key)

            raw_value = str(self.form_raw[key])

            if not self.set_value_from_raw(key, raw_value, data_type):
                raise ValueError("Bad form data for %s" % key)

            if optional:
                optional_count += 1

        if has_optional and optional_count == 0:
            raise ValueError("No optional form data supplied")

        return True

    def get_new_total(self):
        """
        gets the total cost of the table after inserting a new item,
        or editing an item
        """
        return get_table_total(self.table, self.dbx, self.uid)

class UpdateOverview(UpdateData):
    """ update balance data for the overview page """
    def __init__(self, db, uid, form):
        form_schema = {
            'balance':  ('int', False),
            'year':     ('int', False),
            'month':    ('int', False)
        }

        super(UpdateOverview, self).__init__(db, uid, form, form_schema)

    def process(self):
        """ do the actual updating """
        exists_query = self.dbx.query("""
        SELECT COUNT(*) AS count
        FROM balance
        WHERE uid = %s AND year = %s AND month = %s
        """, [self.uid, self.form['year'], self.form['month']])

        if exists_query is False:
            return False

        exists = False
        for row in exists_query:
            count = int(row[0])
            if count > 1:
                return False

            exists = True if count == 1 else False

        if exists:
            query = self.dbx.query("""
            UPDATE `balance` SET balance = %s
            WHERE uid = %s AND year = %s AND month = %s
            """, [self.form['balance'], self.uid, self.form['year'], \
                    self.form['month']])
        else:
            query = self.dbx.query("""
            INSERT INTO `balance` (uid, year, month, balance)
            VALUES (%s, %s, %s, %s)
            """, [self.uid, self.form['year'], self.form['month'], \
                    self.form['balance']])

        if query is False:
            return False

        return True

class UpdateListData(UpdateData):
    """ update an item in a list """
    def __init__(self, db, uid, table, form):
        if table not in LIST_CATEGORIES:
            self.error = True
            self.error_text = E_BAD_PARAMS

        form_schema = list_data_schema(table)

        self.new_total = None

        super(UpdateListData, self).__init__(db, uid, form, \
                form_schema, table=table)

    def process(self):
        """ do the actual updating """
        cols = ', '.join(["%s = %%s" % col \
                for col in self.form if col != 'id'])

        params = [self.form[col] for col in self.form if col != 'id']
        args = params + [self.form['id']]

        query = self.dbx.query("""
        UPDATE `%s` SET %s
        WHERE uid = %d AND id = %%s
        """ % (self.table, cols, self.uid), args)

        if query is False:
            return False

        try:
            self.new_total = self.get_new_total()
        except EnvironmentError:
            return False

        return True

class AddListData(UpdateData):
    """ adds an item to a list """
    def __init__(self, db, uid, table, form):
        if table not in LIST_CATEGORIES:
            self.error = True
            self.error_text = E_BAD_PARAMS

        form_schema = list_data_schema(table, False)

        self.add_id = None
        self.new_total = None

        super(AddListData, self).__init__(db, uid, form, \
                form_schema, all_required=True, table=table)

        if not self.error and \
                ('item' not in self.form or len(self.form['item']) == 0):
            self.error = True
            self.error_text = E_NO_ITEM

    def process(self):
        cols = ', '.join(["%s" % col for col in self.form])

        values = ', '.join(["%s" for col in self.form])

        args = [self.form[col] for col in self.form]

        query = self.dbx.query("""
        INSERT INTO `%s` (uid, %s) VALUES (%d, %s)
        """ % (self.table, cols, self.uid, values), args)

        if query is False:
            return False

        # add last insert id to the response
        self.add_id = self.dbx.last_insert_id()

        try:
            self.new_total = self.get_new_total()
        except ValueError:
            return False

        return True

class DeleteListData(Processor):
    """ delete a list item """
    def __init__(self, db, uid, table, form):
        self.new_total = 0
        self.table = table

        super(DeleteListData, self).__init__(db, uid, form=form)

    def prepare(self):
        if self.table not in LIST_CATEGORIES:
            self.error = True
            self.error_text = E_BAD_PARAMS

        if 'id' not in self.form:
            self.error = True
            self.error_text = E_NO_FORM

        form_id = self.form['id']
        try:
            form_id = int(form_id)
            if form_id < 1:
                raise ValueError

            self.form_id = form_id
        except ValueError:
            self.error = True
            self.error_text = E_BAD_FORM

            return

    def process(self):
        query = self.dbx.query("""
        DELETE FROM `%s` WHERE uid = %d AND id = %%s
        """ % (self.table, self.uid), [self.form_id])

        if query is False:
            return False

        try:
            self.new_total = get_table_total(self.table, self.dbx, self.uid)
        except EnvironmentError:
            return False

        return True

