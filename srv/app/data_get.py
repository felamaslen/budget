""" Methods to get data from the database and display it """

from math import ceil, pi
from datetime import datetime

from app.config import E_NO_PARAMS, E_BAD_PARAMS, \
    PIE_DETAIL, PIE_TOLERANCE, LIST_CATEGORIES
from app.misc import strng
from app.api_data_methods import Processor
from app.data_get_overview import Overview

class ListAll(Processor):
    """ gets all list data """
    def __init__(self, db, uid):
        self.tables = ['overview'] + list(LIST_CATEGORIES)

        super(ListAll, self).__init__(db, uid)

    def process(self):
        processors = [Overview(self.dbx, self.uid)] + \
                [ListData(self.dbx, self.uid, table) \
                for table in LIST_CATEGORIES]

        for key in range(len(self.tables)):
            processor = processors[key]

            if processor.error:
                self.error_text = processor.error_text
                return False

            result = processor.process()

            if result is False:
                return False

            table = self.tables[key]

            self.data[table] = processor.data

        return True

class ListData(Processor):
    """ gets data for a list view such as food, general etc. """
    def __init__(self, db, uid, table, offset=0):
        self.table = table
        self.offset = offset
        self.cols = None

        super(ListData, self).__init__(db, uid)

    def prepare(self):
        """ do necessary things before executing """
        now = datetime.now()

        self.cols = {
            # map abbreviations to columns, to save bandwidth
            'abbr': [
                ['dy', 'year'], ['dm', 'month'], ['dd', 'date'], \
                        ['I', 'id'], ['i', 'item'], ['c', 'cost']
            ],
            # non-standard columns on some tables
            'table': {
                'funds': [['t', 'transactions']],
                'income': [],
                'bills': [],
                'food': [['k', 'category'], ['s', 'shop']],
                'general': [['k', 'category'], ['s', 'shop']],
                'holiday': [['h', 'holiday'], ['s', 'shop']],
                'social': [['y', 'society'], ['s', 'shop']]
            },
            # limit the view to N months per group (can page between groups)
            'limit': {
                'income': 18,
                'food': 1,
                'general': 5,
                'bills': 12
            }
        }

        if self.table not in self.cols['table']:
            self.error = True
            self.error_text = E_BAD_PARAMS

        # merge the specific columns for the specified table,
        # with the standard columns
        this_cols = self.cols['abbr'] + self.cols['table'][self.table]

        self.cols['short'] = [x[0] for x in this_cols]
        self.cols['system'] = [x[1] for x in this_cols]

        # don't display date, month, year columns individually
        self.cols['disp'] = self.cols['short'][3:]

        self.condition = ''

        self.older_exists = None

        # limit (paginate) results for certain tables
        if self.table in self.cols['limit']:
            num_months_view = self.cols['limit'][self.table]

            current_year = int(now.year)
            current_month = int(now.month)

            first_month = (current_month - (self.offset + 1) * \
                    num_months_view - 1) % 12 + 1

            first_year = current_year - int(ceil(float((self.offset + 1) * \
                    num_months_view - current_month + 1) / 12))

            self.condition += """
            AND ((year > %d OR (year = %d AND month >= %d))
            """ % (first_year, first_year, first_month)

            if self.offset > 0:
                last_month = (first_month + num_months_view - 1) % 12 + 1

                last_year = first_year + int(ceil(float(num_months_view - 12 \
                        + first_month) / 12))

                self.condition += """
                AND (year < %d OR (year = %d AND month < %d))
                """ % (last_year, last_year, last_month)

            self.condition += ')'

            older_exists_query = self.dbx.query("""
            SELECT COUNT(*) AS count FROM `%s`
            WHERE uid = %d AND (year < %d OR (year = %d AND month < %d))
            """ % (self.table, self.uid, first_year, \
                    first_year, first_month), [])

            if older_exists_query is False:
                self.error = True
                return

            older_exists = False
            for row in older_exists_query:
                if int(row[0]) > 0:
                    older_exists = True

            self.older_exists = older_exists

    def process(self):
        query = """
        SELECT %s FROM `%s`
        WHERE uid = %d %s
        ORDER BY year DESC, month DESC, date DESC, id DESC
        """ % (', '.join(self.cols['system']), self.table, \
                self.uid, self.condition)

        result = self.dbx.query(query, [])

        if result is False:
            return False

        data = []

        for row in result:
            datum = {}
            datum['d'] = [int(row[0]), int(row[1]), int(row[2])] # date

            j = 3
            for col in self.cols['disp']:
                datum[col] = int(row[j]) if col == 'c' else row[j]
                j += 1

            data.append(datum)

        self.data['data'] = data
        self.data['total'] = self.get_total_cost()
        self.data['older_exists'] = self.older_exists

        return True

    def get_total_cost(self):
        """ gets the total cost of all the items in the list """
        result = self.dbx.query("""
        SELECT SUM(cost) AS total FROM `%s` WHERE uid = %d
        """ % (self.table, self.uid), [])

        if result is False:
            return -1

        for row in result:
            try:
                total = int(row[0])
            except TypeError:
                total = 0
            except ValueError:
                total = 0

        return total

class Pie(Processor):
    """ get pie chart data """
    def __init__(self, db, uid, task):
        super(Pie, self).__init__(db, uid, task)

    def prepare(self):
        if len(self.task) != 1:
            self.error = True
            self.error_text = E_NO_PARAMS
            return

        self.limit = PIE_DETAIL

        self.col = {
            'funds': [['item', 'cost', 'Total']],
            'food': [['shop', 'cost', 'Shop cost'], \
                    ['category', 'cost', 'Category cost']],
            'general': [['shop', 'cost', 'Shop cost'], \
                    ['category', 'cost', 'Category cost']],
            'holiday': [['holiday', 'cost', 'Holiday cost'], \
                    ['holiday', 'int', 'Holiday number']],
            'social': [['shop', 'cost', 'Shop cost'], \
                    ['society', 'cost', 'Society cost']]
        }

        self.table = self.task.popleft()

        if self.table not in self.col:
            self.error = True
            self.error_text = E_BAD_PARAMS
            return

    def process(self):
        threshold = PIE_TOLERANCE / (2 * pi)

        data = []

        queries = [self.query(query[1], query[0]) \
                for query in self.col[self.table]]

        if None in queries:
            return False

        for (key, query) in enumerate(queries):
            result = self.dbx.query(query, [])

            if result is False:
                return False

            pie_data = [[strng(row[0]), int(row[1])] for row in result]

            total = sum([row[1] for row in pie_data])

            if total > 0:
                # concatenate very small slices into a slice called "other"
                other = sum([row[1] for row in pie_data \
                        if float(row[1]) / total < threshold])

                pie_data = [row for row in pie_data \
                        if float(row[1]) / total >= threshold]

                if other > 0:
                    pie_data.append(["Other", other])

                # sort pie data
                pie_data = sorted(pie_data, \
                        key=lambda row: row[1], reverse=True)

            data.append({
                'title':    self.col[self.table][key][2],
                'type':     self.col[self.table][key][1],
                'data':     pie_data,
                'total':    total
            })

        self.data = data

        return True

    def query(self, query_type, query_col):
        """ get a query to execute """
        if query_type == 'cost':
            return """
            SELECT `%s` AS col, SUM(cost) AS cost FROM `%s`
            WHERE uid = %d AND cost > 0
            GROUP BY `%s`
            ORDER BY cost DESC
            LIMIT %d
            """ % (query_col, self.table, self.uid, query_col, self.limit)

        if query_type == 'int':
            return """
            SELECT col, COUNT(*) AS cost FROM (
                SELECT `%s` AS col
                FROM `%s`
                WHERE uid = %d
                GROUP BY year, month, date, col
            ) results
            GROUP BY col
            ORDER BY cost DESC
            LIMIT %d
            """ % (query_col, self.table, self.uid, self.limit)

        return None

class Search(Processor):
    """ instant search suggestions when inserting data """
    def __init__(self, db, uid, task):
        self.table = None
        self.column = None
        self.term = None
        self.max = None

        super(Search, self).__init__(db, uid, task)

    def prepare(self):
        table_cols = {
            'funds':    ['item', 'cost'],
            'bills':    ['item', 'cost'],
            'food':     ['item', 'category', 'cost', 'shop'],
            'general':  ['item', 'category', 'cost', 'shop'],
            'holiday':  ['item', 'holiday', 'cost', 'shop'],
            'social':   ['item', 'society', 'cost', 'shop']
        }

        default_max = 1

        if len(self.task) == 3:
            self.task.append(default_max)

        if len(self.task) != 4:
            self.error = True
            self.error_text = E_NO_PARAMS
            return

        self.table, self.column, self.term, self.max = self.task

        try:
            self.max = int(self.max)
        except ValueError:
            self.max = default_max

        if self.table not in table_cols or \
                self.column not in table_cols[self.table]:
            self.error = True
            self.error_text = E_BAD_PARAMS

    def process(self):
        """ get data from database """
        query = """
        SELECT `%s` AS col, SUM(IF(`%s` LIKE %%s, 1, 0)) AS matches
        FROM `%s`
        WHERE uid = %d AND `%s` LIKE %%s
        GROUP BY col
        ORDER BY matches DESC
        LIMIT %%s
        """ % (self.column, self.column, self.table, self.uid, self.column)

        result = self.dbx.query(query, [self.term + '%', \
                '%' + self.term + '%', self.max])

        if result is False:
            return False

        self.data = [strng(col) for (col, _) in result]

        return True

class Stocks(Processor):
    """ get stocks list for funds page """
    def __init__(self, db, uid):
        super(Stocks, self).__init__(db, uid)

    def process(self):
        """ get data """
        return self.get_stocks()

    def get_stocks(self):
        """ get list of stocks from database """
        result = self.dbx.query("""
        SELECT code, name, SUM(weight * subweight) AS sum_weight
        FROM stocks
        WHERE uid = %s
        GROUP BY code
        ORDER BY sum_weight DESC
        """, [self.uid])

        if result is False:
            return False

        stocks = []
        total_weight = 0

        for (code, name, weight) in result:
            this_weight = int(weight)
            stocks.append([code, name, this_weight])
            total_weight += this_weight

        self.data['stocks'] = stocks
        self.data['total'] = total_weight

        return True

