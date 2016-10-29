from api_data_methods import processor

from misc import strng, list_data_schema, deserialise_date
from config import LIST_CATEGORIES, E_BAD_PARAMS, E_BAD_FORM, E_NO_FORM

class update_data(processor):
    def __init__(self, db, uid, form, schema):
        super(update_data, self).__init__(db, uid)

        self.form_raw = form

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
                if optional:
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

        return True
