"""
Operates on (retrieve, add, edit, delete) data in the database
Does not handle authentication
"""

import time
from math import ceil
from datetime import datetime, timedelta
from itertools import groupby

from config import E_NO_PARAMS, E_BAD_PARAMS, FUND_SALT, GRAPH_FUND_HISTORY_DETAIL
from misc import fund_hash

class response(object):
    def __init__(self, db, uid, task, args):
        self.db = db
        self.uid = uid

        self.error      = False
        self.errorText  = ""
        self.data       = {}

        self.serverError = False

        self.task = task
        self.args = args

        self.execute()

    def get_response(self):
        if self.serverError:
            return None

        response = {}
        response['error']       = self.error
        response['errorText']   = self.errorText
        response['data']        = self.data

        return response

    def execute(self):
        """ does the operation """
        if len(self.task) == 0:
            self.error = True
            self.errorText = "No parameter given"

            return

class retrieve(response):
    """ retrieves data from the database """
    def __init__(self, db, uid, task, args):
        super(retrieve, self).__init__(db, uid, task, args)

    def execute(self):
        super(retrieve, self).execute()

        this_processor = None

        arg = self.task.popleft()

        """ decide which processor to run """
        if arg == 'analysis':
            this_processor = analysis(self.db, self.uid, self.task)
        elif arg == 'analysis_category':
            this_processor = analysis_category(self.db, self.uid, self.task)

        elif arg == 'all':
            this_processor = list_all(self.db, self.uid)

        elif arg in ('in', 'bills', 'food', 'general', 'holiday', 'social'):
            offset = self.task.popleft() if len(self.task) > 0 else 0

            if offset is None:
                offset = 0

            offset = int(offset)

            if offset < 0:
                offset = 0

            this_processor = list_data(self.db, self.uid, arg, offset)

        elif arg == 'funds':
            this_processor = funds(self.db, self.uid)

        elif arg == 'fund_history':
            deep = 'deep' in self.args
            this_processor = fund_history(self.db, self.uid, deep)

        elif arg == 'search':
            this_processor = search(self.db, self.uid, self.task)

        elif arg == 'stocks':
            this_processor = stocks(self.db, self.uid)

        """ decide whether the processor is valid """
        if this_processor is None:
            result = None
        elif this_processor.error:
            result = this_processor
        else:
            result = this_processor.process()

        if result is not None:
            self.error      = True if result is False else this_processor.error
            self.errorText  = this_processor.errorText
            self.data       = this_processor.data

        else:
            self.error      = True
            self.errorText  = "Unknown task"

class processor(object):
    def __init__(self, db, uid):
        self.db = db
        self.uid = uid

        self.error = False
        self.errorText = ""

        self.data = {}

class list_all(processor):
    def __init__(self, db, uid):
        super(list_all, self).__init__(db, uid)

        self.list_tables = ('funds', 'in', 'bills', 'food', 'general', 'holiday', 'social')

    def process(self):
        for table in self.list_tables:
            this_processor = list_data(self.db, self.uid, table)

            if this_processor.error:
                self.errorText = this_processor.errorText
                return False

            result = this_processor.process()

            if result is False:
                return False

            self.data[table] = this_processor.data

        return True

class list_data(processor):
    """ gets data for a list view such as food, general etc. """
    def __init__(self, db, uid, table, offset = 0):
        super(list_data, self).__init__(db, uid)

        self.table  = table
        self.offset = offset

        """ map abbreviations to columns, to save bandwidth """
        cols = [
            ['dy', 'year'], ['dm', 'month'], ['dd', 'date'], ['I', 'id'], ['i', 'item'], ['c', 'cost']
        ]

        """ non-standard columns on some tables """
        table_cols = {
            'funds':    [['u', 'units']],
            'in':       [],
            'bills':    [],
            'food':     [['k', 'category'], ['s', 'shop']],
            'general':  [['k', 'category'], ['s', 'shop']],
            'holiday':  [['h', 'holiday'],  ['s', 'shop']],
            'social':   [['y', 'society'],  ['s', 'shop']]
        }

        """ limit the view to N months per group (can page between groups) """
        limit_cols = {
            'food':     1,
            'general':  5,
            'bills':    24
        }

        if self.table not in table_cols:
            self.error = True
            self.errorText = E_BAD_PARAMS

        """ merge the specific columns for the specified table, with the standard columns """
        this_cols = cols + table_cols[self.table]

        self.colShort   = map(lambda x: x[0], this_cols)
        self.colSystem  = map(lambda x: x[1], this_cols)

        """ don't display date, month, year columns individually """
        self.colDisp    = self.colShort[3:]

        self.condition = ''

        self.older_exists = None

        """ limit (paginate) results for certain tables """
        if self.table in limit_cols:
            num_months_view = limit_cols[self.table]

            now = datetime.now()

            current_year    = int(now.year)
            current_month   = int(now.month)

            first_month = (current_month - (offset + 1) * num_months_view - 1) % 12 + 1

            first_year = current_year - int(
                    ceil(float((offset + 1) * num_months_view - current_month + 1) / 12))

            self.condition += """
            AND ((year > %d OR (year = %d AND month >= %d))
            """ % (first_year, first_year, first_month)

            if offset > 0:
                last_month = (first_month + num_months_view - 1) % 12 + 1

                last_year = first_year + int(ceil(float(num_months_view - 12 + first_month) / 12))

                self.condition += """
                AND (year < %d OR (year = %d AND month < %d))
                """ % (last_year, last_year, last_month)

            self.condition += ')'

            older_exists_query = self.db.query("""
            SELECT COUNT(*) AS count FROM `%s`
            WHERE uid = %d AND (year < %d OR (year = %d AND month < %d))
            """ % (self.table, self.uid, first_year, first_year, first_month), [])

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
        """ % (', '.join(self.colSystem), self.table, self.uid, self.condition)

        result = self.db.query(query, [])

        if result is False:
            return False

        data = []

        for row in result:
            datum = {}
            datum['d'] = [int(row[0]), int(row[1]), int(row[2])] # date

            j = 3
            for col in self.colDisp:
                datum[col] = int(row[j]) if col == 'c' else row[j]
                j += 1

            data.append(datum)

        self.data['data'] = data

        self.data['total'] = self.get_total_cost()

        self.data['older_exists'] = self.older_exists

        return True

    def get_total_cost(self):
        result = self.db.query("""
        SELECT SUM(cost) AS total FROM `%s` WHERE uid = %d
        """ % (self.table, self.uid), [])

        if result is False:
            return -1

        for row in result:
            total = int(row[0])

        return total

class funds(list_data):
    def __init__(self, db, uid):
        super(funds, self).__init__(db, uid, 'funds')

        self.cache = None

        self.get_cache_latest()

    def process(self):
        if self.cache is None:
            return False

        if super(funds, self).process() is False:
            return False

        """ add latest fund values to the fetched data """
        self.data['data'] = map(self.add_cache_value, self.data['data'])

        return True

    def add_cache_value(self, fund):
        hashValue = fund_hash(fund['i'])

        fund['P'] = self.cache[hashValue] if hashValue in self.cache else 0

        return fund

    def get_cache_latest(self):
        result = self.db.query("""
        SELECT f.hash, c.price
        FROM (
            SELECT fid, MAX(ctg.time) AS latest
            FROM fund_cache_time ctg
            INNER JOIN fund_cache cg ON cg.cid = ctg.cid
            WHERE ctg.done = 1
            GROUP BY cg.fid
        ) x
        INNER JOIN fund_cache_time ct ON ct.time = x.latest
        INNER JOIN fund_hash f ON f.fid = x.fid
        INNER JOIN fund_cache c ON c.fid = x.fid AND c.cid = ct.cid
        GROUP BY f.fid
        """, [])

        if result is False:
            return

        self.cache = {}
        for (hashValue, price) in result:
            self.cache[hashValue] = float(price)

class fund_history(processor):
    def __init__(self, db, uid, deep):
        super(fund_history, self).__init__(db, uid)

        self.num_results_display = GRAPH_FUND_HISTORY_DETAIL

        self.deep = deep

    def process(self):
        if self.deep: # retrieve individual fund values
            return self.process_deep()

        return self.process_shallow()

    def process_deep(self):
        num_results_query = self.db.query("""
        SELECT COUNT(*) AS num_results
        FROM funds f
        INNER JOIN fund_hash fh ON fh.hash = MD5(CONCAT(f.item, %%s))
        INNER JOIN fund_cache fc ON fh.fid = fc.fid
        INNER JOIN fund_cache_time c ON c.cid = fc.cid AND c.done = 1
        WHERE f.uid = %d
        GROUP BY c.cid""" % self.uid, [FUND_SALT])

        if num_results_query is False:
            return False

        num_results = -1
        for row in num_results_query:
            num_results = int(row[0])

        if num_results < 0:
            return False

        query = self.db.query("""
        SELECT * FROM (
          SELECT item, fid, time, value, FLOOR(cNum %% (%d / %d)) AS period FROM (
            SELECT x.item, x.fid, x.time, x.value,
            (
              CASE x.cid
                WHEN @lastCid THEN @cNum
                ELSE @cNum := @cNum + 1 END
            ) AS cNum,
            @lastCid := x.cid AS last_cid
            FROM (
              SELECT c.cid, fc.fid, f.item, c.time, (fc.price * fc.units) AS value
              FROM (SELECT DISTINCT item FROM funds WHERE uid = %d) f
              INNER JOIN fund_hash fh ON fh.hash = MD5(CONCAT(f.item, %%s))
              INNER JOIN fund_cache fc ON fh.fid = fc.fid
              INNER JOIN fund_cache_time c ON c.done = 1 AND c.cid = fc.cid
            ) x
            JOIN (SELECT @cNum := 0, @lastCid := 0) r
          ) ranked
        ) list
        WHERE period = 0
        ORDER BY time, item""" % (num_results, self.num_results_display, self.uid), [FUND_SALT])

        if query is False:
            return False

        rows = []

        start_time = None

        funds = []
        fid_keys = {}
        num_fids = 0

        time_key = -1
        times = []

        for (item, fid, time, value, period) in query:
            item = str(item)

            time = int(time)
            value = int(round(value))

            fid = int(fid)

            if fid not in fid_keys:
                fid_keys[fid] = num_fids
                num_fids += 1

            fid_key = fid_keys[fid]

            if item not in funds:
                funds.append(item)

            if start_time is None:
                start_time = time

            if time not in times:
                """ make sure each item has a consistent number of points (0 is better than null) """
                row = [0] * (fid_key - 1) if fid_key > 0 else []
                row.append(value)

                rows.append([time - start_time, row])
                time_key += 1

                times.append(time)
            else:
                if fid_key >= len(rows[time_key][1]):
                    if fid_key > len(rows[time_key][1]):
                        rows[time_key][1] += [0] * (fid_key - 1 - len(rows[time_key][1]))
                    rows[time_key][1].append(value)
                else:
                    rows[time_key][1][fid_key] = value

        total_time = 0 if start_time is None else time - start_time

        results = [item + [sum(item[1])] for item in rows]

        self.data['funds']      = funds
        self.data['history']    = results
        self.data['startTime']  = start_time
        self.data['totalTime']  = total_time

        return True

    def process_shallow(self):
        num_results_query = self.db.query("""
        SELECT COUNT(*) AS num_results FROM (
            SELECT c.cid
            FROM (SELECT DISTINCT item FROM funds WHERE uid = %d) f
            INNER JOIN fund_hash fh ON fh.hash = MD5(CONCAT(f.item, "%s"))
            INNER JOIN fund_cache fc ON fh.fid = fc.fid
            INNER JOIN fund_cache_time c ON c.done = 1 AND c.cid = fc.cid
            GROUP BY fc.cid
        ) results""" % (self.uid, FUND_SALT), [])

        if num_results_query is False:
            return False

        num_results = -1
        for row in num_results_query:
            num_results = int(row[0])

        if num_results < 0:
            return False

        query = self.db.query("""
        SELECT * FROM (
          SELECT time, value, rownum, FLOOR(rownum %% (%d / %d)) AS period FROM (
            SELECT @row := @row + 1 AS rownum,
                time,
                value
            FROM (
                SELECT @row := -1
            ) r, (
                SELECT c.time, SUM(fc.price * fc.units) AS value
                FROM (SELECT DISTINCT item FROM funds WHERE uid = %d) f
                INNER JOIN fund_hash fh ON fh.hash = MD5(CONCAT(f.item, "%s"))
                INNER JOIN fund_cache fc ON fh.fid = fc.fid
                INNER JOIN fund_cache_time c ON c.done = 1 AND c.cid = fc.cid
                GROUP BY fc.cid
                ORDER BY c.time DESC
            ) results
            ORDER BY time ASC
            ) ranked
          ) list
          WHERE period = 0 OR rownum = %d
        """ % (num_results, self.num_results_display - 1, self.uid, FUND_SALT, num_results - 1), [])

        if query is False:
            return False

        results = []

        start_time = None

        total_time = 0

        for (time, value, rownum, period) in query:
            time = int(time)
            value = int(round(value))

            if start_time is None:
                start_time = time

            results.append([time - start_time, value])

        total_time = time - start_time

        self.data['history']    = results
        self.data['startTime']  = start_time
        self.data['totalTime']  = total_time

        return True

class search(processor):
    def __init__(self, db, uid, task):
        super(search, self).__init__(db, uid)

        table_cols = {
            'funds':    ['item', 'units', 'cost'],
            'in':       ['item', 'cost'],
            'bills':    ['item', 'cost'],
            'food':     ['item', 'category', 'cost', 'shop'],
            'general':  ['item', 'category', 'cost', 'shop'],
            'holiday':  ['item', 'holiday', 'cost', 'shop'],
            'social':   ['item', 'society', 'cost', 'shop']
        }

        default_max = 1

        if len(task) == 3:
            task.append(default_max)

        if len(task) != 4:
            self.error = True
            self.errorText = E_NO_PARAMS
            return

        self.table, self.column, self.term, self.max = task

        try:
            self.max = int(self.max)
        except:
            self.max = default_max

        if self.table not in table_cols or self.column not in table_cols[self.table]:
            self.error = True
            self.errorText = E_BAD_PARAMS

    def process(self):
        query = """
        SELECT `%s` AS col, SUM(IF(`%s` LIKE %%s, 1, 0)) AS matches
        FROM `%s`
        WHERE uid = %d AND `%s` LIKE %%s
        GROUP BY col
        ORDER BY matches DESC
        LIMIT %%s
        """ % (self.column, self.column, self.table, self.uid, self.column)

        result = self.db.query(query, [self.term + '%', '%' + self.term + '%', self.max])

        if result is False:
            return False

        self.data = [str(col) for (col, matches) in result]

        return True

class stocks(processor):
    def __init__(self, db, uid):
        super(stocks, self).__init__(db, uid)

    def process(self):
        return self.get_stocks()

    def get_stocks(self):
        result = self.db.query("""
        SELECT code, name, SUM(weight * subweight) AS weight
        FROM stocks
        GROUP BY code
        ORDER BY weight DESC
        """, [])

        if result is False:
            return False

        stocks = {}
        total_weight = 0

        for (code, name, weight) in result:
            this_weight = int(weight)
            stocks[code] = { 'n': str(name), 'w': this_weight }
            total_weight += this_weight

        self.data['stocks'] = stocks
        self.data['total'] = total_weight

        return True

class data_analysis(processor):
    def __init__(self, db, uid, task, num_params = 0):
        super(data_analysis, self).__init__(db, uid)

        self.categories = ['bills', 'food', 'general', 'holiday', 'social']
        self.periods    = ['week', 'month', 'year']
        self.groupings  = ['category', 'shop']

        self.e_invalid_category = "Invalid category"
        self.e_invalid_period   = "Invalid period"
        self.e_invalid_grouping = "Invalid grouping"
        self.e_invalid_index    = "Invalid index"

        if len(task) < num_params:
            self.error      = True
            self.errorText  = E_NO_PARAMS

    def process(self):
        self.condition = self.period_condition(self.period, self.index)

        self.valid_params = self.validate_task(self.period, self.grouping, self.index)

    def validate_task(self, period, grouping, index):
        valid = True

        if period not in self.periods:
            self.error      = True
            self.errorText  = self.e_invalid_period
            valid = False
        elif grouping not in self.groupings:
            self.error      = True
            self.errorText  = self.e_invalid_grouping
            valid = False
        elif not index >= 0:
            self.error      = True
            self.errorText  = self.e_invalid_index
            valid = False

        return valid

    def period_condition(self, period, index):
        now = datetime.now()

        if period == 'week':
            t0 = now - timedelta(days = now.weekday()) - timedelta(weeks = index)
            t1 = t0 + timedelta(weeks = 1)

            year0, month0, date0 = map(int, t0.strftime('%Y-%m-%d').split('-'))
            year1, month1, date1 = map(int, t1.strftime('%Y-%m-%d').split('-'))

            condition = """(
                year > %s OR (year = %s AND (month > %s OR (month = %s AND date >= %s)))
            ) AND (
                year < %s OR (year = %s AND (month < %s OR (month = %s AND month < %s)))
            )"""

            condition_args = [year0, year0, month0, month0, date0, year1, year1, month1, month1, date1]

            description = "Week beginning %s/%s/%s" % (date0, month0, year0)

        elif period == 'month':
            year = int(now.year - ceil(float(index + 1 - now.month) / 12))

            month = (now.month - index - 1) % 12 + 1

            if month <= 0:
                month += 12

            condition = "year = %s AND month = %s"

            condition_args = [year, month]

            months = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"]

            description = "%s %s" % (months[month - 1], year)

        elif period == 'year':
            year = now.year - index

            condition = "year = %s"

            condition_args = [year]

            description = str(year)

        else:
            return None

        return {
            'query':    condition,
            'args':     condition_args,
            'desc':     description
        }

    def get_category_column(self, category, grouping):
        group = None

        if category == 'bills':
            group = 'item'

        elif grouping == 'category':
            if category == 'food' or category == 'general':
                group = 'category'

            elif category == 'social':
                group = 'society'

            elif category == 'holiday':
                group = 'holiday'

            else:
                group = 'item'

        elif grouping == 'shop':
            group = 'shop'

        return group

class analysis(data_analysis):
    """ gets analysis data """
    def __init__(self, db, uid, task):
        super(analysis, self).__init__(db, uid, task, 3)
        if self.error:
            return

        self.period, self.grouping, self.index = task

        try:
            self.index = int(self.index)
        except:
            self.index = 0

    def process(self):
        super(analysis, self).process()

        if self.valid_params is False:
            return False

        cost = [[category, self.get_items(category)] for category in self.categories]

        self.data['cost'] = cost
        self.data['description'] = self.condition['desc']

        return True

    def get_items(self, category):
        category_column = self.get_category_column(category, self.grouping)

        query = """
        SELECT `%s` AS item_col, SUM(cost) AS cost
        FROM `%s`
        WHERE %s AND uid = %d AND cost > 0
        GROUP BY item_col
        """ % (category_column, category, self.condition['query'], self.uid)

        result = self.db.query(query, self.condition['args'])

        if result is False:
            return None

        items = []

        for (item_col, cost) in result:
            items.append([item_col, int(cost)])

        return items

class analysis_category(data_analysis):
    """ gets deeper analysis data """
    def __init__(self, db, uid, task):
        super(analysis_category, self).__init__(db, uid, task, 4)
        if self.error:
            return

        self.category, self.period, self.grouping, self.index = task

        try:
            self.index = int(self.index)
        except:
            self.index = 0

    def process(self):
        super(analysis_category, self).process()

        if self.valid_params:
            if self.category not in self.categories:
                self.error      = True
                self.errorText  = self.e_invalid_category
                self.valid_params = False

            elif self.category == 'bills':
                self.error      = True
                self.errorText  = "Bills aren't categorised"
                self.valid_params = False

        if self.valid_params is False:
            return False

        items = self.get_items()

        self.data['items'] = items

        return True

    def get_items(self):
        category_column = self.get_category_column(self.category, self.grouping)

        query = """
        SELECT item, `%s` AS item_col, SUM(cost) AS cost
        FROM `%s`
        WHERE %s AND uid = %d AND cost > 0
        GROUP BY item, item_col
        ORDER BY item_col
        """ % (category_column, self.category, self.condition['query'], self.uid)

        result = self.db.query(query, self.condition['args'])

        if result is False:
            return None

        values = [[str(item_col), str(item), int(cost)] for (item, item_col, cost) in result]

        items = [[k, [x[1:] for x in g]] for k, g in groupby(values, key = lambda x: x[0])]

        return items
