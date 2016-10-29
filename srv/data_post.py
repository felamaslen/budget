from api_data_methods import processor

from misc import strng, list_data_schema, deserialise_date, get_table_total
from config import LIST_CATEGORIES, E_BAD_PARAMS, E_BAD_FORM, E_NO_FORM

class update_data(processor):
    def __init__(self, db, uid, form, schema, all_required = False):
        super(update_data, self).__init__(db, uid)

        self.form_raw = form
        self.all_required = all_required

        form_valid = False

        try:
            form_valid = self.validate_form(schema)

            if form_valid is False:
                self.error = True
                self.errorText = E_BAD_FORM

        except Exception as paramError:
            self.error = True
            self.errorText = str(paramError)

    def validate_form(self, schema):
        self.form = {}

        optionalCount = 0

        for (key, (dataType, optional)) in schema.items():
            if key not in self.form_raw:
                if optional and not self.all_required:
                    continue
                else:
                    raise Exception("Form data for %s not supplied" % key)

            raw_value = self.form_raw[key]

            if raw_value is None:
                raise Exception("Form data for %s is null" % key)

            value = None

            if dataType == 'date':
                try:
                    value = deserialise_date(raw_value)
                except ValueError as dateError:
                    raise Exception(dateError)

                self.form['year']   = value[0]
                self.form['month']  = value[1]
                self.form['date']   = value[2]

            else:
                if dataType == 'int':
                    try:
                        value = int(raw_value)
                    except ValueError:
                        return False

                elif dataType == 'float':
                    try:
                        value = float(raw_value)
                    except ValueError:
                        return False

                elif dataType == 'string':
                    try:
                        value = strng(raw_value)
                    except:
                        raise Exception("Error with text value for %s" % key)

                if value is None:
                    return False

                self.form[key] = value

            if optional:
                optionalCount += 1

        if optionalCount == 0:
            raise Exception("No optional form data supplied")

        return True

    def get_new_total(self):
        """ gets the total cost of the table after inserting a new item,
        or editing an item """

        return get_table_total(self.table, self.db, self.uid)

class update_overview(update_data):
    def __init__(self, db, uid, form):
        form_schema = {
            'balance':  ('int', False),
            'year':     ('int', False),
            'month':    ('int', False)
        }

        super(update_overview, self).__init__(db, uid, form, form_schema)

    def process(self):
        exists_query = self.db.query("""
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
            query = self.db.query("""
            UPDATE `balance` SET balance = %s
            WHERE uid = %s AND year = %s AND month = %s
            """, [self.form['balance'], self.uid, self.form['year'], self.form['month']])
        else:
            query = self.db.query("""
            INSERT INTO `balance` (uid, year, month, balance)
            VALUES (%s, %s, %s, %s)
            """, [self.uid, self.form['year'], self.form['month'], self.form['balance']])

        if query is False:
            return False

        return True

class update_list_data(update_data):
    def __init__(self, db, uid, table, form):
        if table not in LIST_CATEGORIES:
            self.error = True
            self.errorText = E_BAD_PARAMS

        self.table = table

        form_schema = list_data_schema(table)

        super(update_list_data, self).__init__(db, uid, form, form_schema)

    def process(self):
        cols = ', '.join(["%s = %%s" % col for col in self.form if col != 'id'])

        params = [self.form[col] for col in self.form if col != 'id']
        args = params + [self.form['id']]

        query = self.db.query("""
        UPDATE `%s` SET %s
        WHERE uid = %d AND id = %%s
        """ % (self.table, cols, self.uid), args)

        if query is False:
            return False

        try:
            self.new_total = self.get_new_total()
        except:
            return False

        return True

class add_list_data(update_data):
    def __init__(self, db, uid, table, form):
        if table not in LIST_CATEGORIES:
            self.error = True
            self.errorText = E_BAD_PARAMS

        self.table = table

        form_schema = list_data_schema(table, False)

        super(add_list_data, self).__init__(db, uid, form, form_schema, True)

    def process(self):
        cols = ', '.join(["%s" % col for col in self.form])

        values = ', '.join(["%s" for col in self.form])

        args = [self.form[col] for col in self.form]

        query = self.db.query("""
        INSERT INTO `%s` (uid, %s) VALUES (%d, %s)
        """ % (self.table, cols, self.uid, values), args)

        if query is False:
            return False

        self.add_id = self.db.last_insert_id() # add last insert id to the response

        try:
            self.new_total = self.get_new_total()
        except:
            return False

        return True

class delete_list_data(processor):
    def __init__(self, db, uid, table, form):
        super(delete_list_data, self).__init__(db, uid)

        if table not in LIST_CATEGORIES:
            self.error = True
            self.errorText = E_BAD_PARAMS

        self.table = table

        if 'id' not in form:
            self.error = True
            self.errorText = E_NO_FORM

        form_id = form['id']
        try:
            form_id = int(form_id)
            if form_id < 1:
                raise Exception

            self.form_id = form_id
        except:
            self.error = True
            self.errorText = E_BAD_FORM

            return

    def process(self):
        query = self.db.query("""
        DELETE FROM `%s` WHERE uid = %d AND id = %%s
        """ % (self.table, self.uid), [self.form_id])

        if query is False:
            return False

        try:
            self.new_total = get_table_total(self.table, self.db, self.uid)
        except:
            return False

        return True
