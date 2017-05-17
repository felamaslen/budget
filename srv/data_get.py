""" Methods to get data from the database and display it """

from math import ceil, pi

import time
from datetime import datetime
import json

from srv.api_data_methods import Processor
from srv.misc import fund_hash, strng
from srv.config import E_NO_PARAMS, E_BAD_PARAMS,\
    FUND_SALT, GRAPH_FUND_HISTORY_DETAIL,\
    PIE_DETAIL, PIE_TOLERANCE,\
    OVERVIEW_NUM_LAST, OVERVIEW_NUM_FUTURE, START_YEAR, START_MONTH,\
    LIST_CATEGORIES

def get_year_months(past_months, future_months):
    """ gets a range of [year, month] corresponding to the view """
    now = datetime.now()

    start_month = int((now.month - past_months + 11) % 12 + 1)
    start_year = int(now.year - max(0, ceil(float(past_months \
            - now.month + 1) / 12)))

    if start_year < START_YEAR or (start_year == START_YEAR \
            and start_month < START_MONTH):
        start_year = START_YEAR
        start_month = START_MONTH

    end_month = (now.month + future_months - 1) % 12 + 1
    end_year = now.year + int(ceil(float(future_months \
            - 12 + now.month) / 12))

    return [(y, m) for y in range(start_year, end_year + 1) \
            for m in range(1, 13)
            if (y > start_year or m >= start_month) and \
                    (y < end_year or m <= end_month)]

def get_fund_cost(year_month, transactions):
    """ gets the total cost up to a certain date of a fund """
    return reduce(lambda last, item: \
        last + (item['c'] if \
        (year_month[0] > item['d'][0] or \
        (year_month[0] == item['d'][0] and year_month[1] >= item['d'][1])) \
        else 0), transactions, 0)

class Overview(Processor):
    """ get overview data """
    def __init__(self, db, uid):
        super(Overview, self).__init__(db, uid)

        self.year_months = get_year_months(OVERVIEW_NUM_LAST, \
                OVERVIEW_NUM_FUTURE)

    def process(self):
        """ Get data and put it in the instance """
        categories = LIST_CATEGORIES
        balance, old = self.get_balance()
        month_cost = {}

        try:
            for category in categories:
                month_cost[category] = self.get_category_data(category)

        except EnvironmentError as error:
            self.error_text = "%s" % error

            return False

        month_cost['balance'] = balance
        month_cost['old'] = old

        now = datetime.now()

        self.data['cost'] = month_cost
        self.data['startYearMonth'] = list(self.year_months[0])
        self.data['endYearMonth'] = \
                list(self.year_months[len(self.year_months) - 1])
        self.data['currentYear'] = int(now.year)
        self.data['currentMonth'] = int(now.month)
        self.data['futureMonths'] = OVERVIEW_NUM_FUTURE

        return True

    def get_category_data(self, category):
        """ get costs for each month in each category """
        get_funds = category == "funds"
        if get_funds:
            query = """
            SELECT transactions FROM `funds` WHERE uid = %d
            """ % (self.uid)

        else:
            union = "SELECT %d AS y, %d AS m UNION " % self.year_months[0] + \
                    " UNION ".join(["SELECT %d, %d" % self.year_months[i] \
                    for i in range(1, len(self.year_months))])

            query = """
            SELECT SUM(cost) AS month_cost FROM (%s) AS dates
            LEFT JOIN `%s` AS list
            ON uid = %d AND ((list.year = dates.y AND list.month = dates.m))
            GROUP BY y, m
            """ % (union, category, self.uid)

        result = self.dbx.query(query, [])

        if result is False:
            raise EnvironmentError("database error")

        if get_funds:
            transactions = []
            for row in result:
                try:
                    fund_transactions = json.loads(row[0])
                    transactions.append(fund_transactions)
                except ValueError:
                    pass # bad json; ignore

            return [reduce(lambda last, item: last + item, [ \
                    get_fund_cost(self.year_months[j], transactions[i]) \
                    for i in range(len(transactions))]) \
                    for j in range(len(self.year_months))]

        return [0 if row[0] is None else int(row[0]) for row in result]

    def get_balance(self):
        """ gets balance for each month """
        ym1 = self.year_months[0]
        ym2 = self.year_months[len(self.year_months) - 1]

        query = self.dbx.query("""
        SELECT year, month, balance
        FROM balance
        WHERE uid = %d
        ORDER BY year, month
        """ % self.uid)
        if query is False:
            return None

        balance = []
        old = []
        old_range = [0, 0, 0, 0]
        for (year, month, value) in query:
            in_list = (year > ym1[0] or (year == ym1[0] and month >= ym1[1])) \
                    and (year < ym2[0] or (year == ym2[0] and month <= ym2[1]))
            if in_list:
                key = 12 * (year - ym1[0]) + month - ym1[1]
                balance += [0] * max(0, key + 1 - len(balance))
                balance[key] = int(value)
            else:
                old_range[2] = max(old_range[2], year)
                old_range[3] = max(old_range[3], month)

                if old_range[0] == 0 and old_range[1] == 0:
                    old_range[0] = year
                    old_range[1] = month

                key = 12 * (year - old_range[0]) + month - old_range[1]

                old += [0] * max(0, key + 1 - len(old))
                old[key] = value

        balance += [0] * max(0, 12 * (ym2[0] - ym1[0]) + ym2[1] - ym1[1] \
                + 1 - len(balance))
        old += [0] * max(0, 12 * (ym1[0] - old_range[2]) + ym2[1] - \
                old_range[3] + 1 - len(old))

        return balance, old

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
                'in': [],
                'bills': [],
                'food': [['k', 'category'], ['s', 'shop']],
                'general': [['k', 'category'], ['s', 'shop']],
                'holiday': [['h', 'holiday'], ['s', 'shop']],
                'social': [['y', 'society'], ['s', 'shop']]
            },
            # limit the view to N months per group (can page between groups)
            'limit': {
                'food':     1,
                'general':  5,
                'bills':    12
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
            except ValueError:
                total = 0

        return total

class Funds(ListData):
    """ fund page list data """
    def __init__(self, db, uid, history=False):
        super(Funds, self).__init__(db, uid, 'funds')

        self.cache = None
        self.history = history

        self.get_cache_latest()

    def process(self):
        if self.cache is None:
            return False

        if super(Funds, self).process() is False:
            return False

        # add latest fund values to the fetched data
        self.data['data'] = [self.add_cache_value(item) \
                for item in self.data['data']]

        if self.history:
            # get history as well, for graphs
            history_processor = FundHistory(self.dbx, self.uid, self.history)
            history_processor.process()

            self.data['history'] = history_processor.data

        return True

    def add_cache_value(self, fund):
        """ add latest cached fund price to fund item """
        hash_value = fund_hash(fund['i'])
        fund['P'] = self.cache[hash_value] if hash_value in self.cache else 0

        return fund

    def get_cache_latest(self):
        """ get the latest cached fund value """
        result = self.dbx.query("""
        SELECT fh.hash, GROUP_CONCAT(fc.price ORDER BY ct.time DESC) AS prices
        FROM fund_cache_time ct
        INNER JOIN fund_cache fc ON fc.cid = ct.cid
        INNER JOIN fund_hash fh ON fh.fid = fc.fid
        GROUP BY fc.fid
        """, [])

        if result is False:
            return

        self.cache = {}
        for (hash_value, price) in result:
            price = float(price.split(',')[0])
            self.cache[hash_value] = price

def fund_history(fund_query, query):
    """ get full fund history with individual funds (query processor) """

    # associate fids with fund names
    funds = {}
    for (_fid, _item, _transactions) in fund_query:
        funds[_fid] = [_item, _transactions]

    times = {
        'start': None, # start time of history
        'total': None, # total time length of history
        #'list': [], # TODO
        #'key': -1 # TODO
    }

    results = {'funds': {'items': [], 'transactions': []}, 'rows': []}

    fid = {'keys': {}, 'num': 0}

    the_time = None
    for (fids, time, prices, _, _) in query:
        fids = fids.split(',')
        prices = prices.split(',')

        the_time = int(time)
        if times['start'] is None:
            times['start'] = the_time

        row = [] if fid['num'] == 0 else [0] * fid['num']
        for j, _fid in enumerate(fids):
            this_fid = int(_fid)

            item = strng(funds[this_fid][0])
            if item not in results['funds']['items']:
                results['funds']['items'].append(item)
                results['funds']['transactions'].append(json.loads(funds[this_fid][1]))

            if this_fid not in fid['keys']:
                fid['keys'][this_fid] = fid['num']
                fid['num'] += 1

            value = float(prices[j])

            if fid['keys'][this_fid] > len(row) - 1:
                row.append(value)
            else:
                row[fid['keys'][this_fid]] = value

        results['rows'].append([the_time - times['start'], row])

    times['total'] = 0 if times['start'] is None else the_time - times['start']

    return results['funds'], results['rows'], times['start'], times['total']

class FundHistory(Processor):
    """ get fund value history for graph """
    def __init__(self, db, uid, options):
        super(FundHistory, self).__init__(db, uid)

        self.num_results_display = GRAPH_FUND_HISTORY_DETAIL

        self.options = options

    def get_min_time_cond(self):
        """ get a query condition for limiting results by age """
        min_time = 0
        if self.options['period']:
            now = int(time.time())
            times = [('year', [365, [1, 5]]), ('month', [30, [1, 3]])]
            for (key, period) in times:
                for count in period[1]:
                    if self.options['period'] == str(key) + str(count):
                        min_time = now - 3600 * 24 * period[0] * count
                        break
                if min_time > 0:
                    break

        min_time_cond = "c.time > %d" % min_time

        return min_time_cond

    def process(self):
        """ get full fund history with individual funds """

        min_time_cond = self.get_min_time_cond()

        # get the number of total results in the database, for use in filtering
        num_results_query = self.dbx.query("""
        SELECT COUNT(*) AS num_results FROM (
        SELECT c.cid
        FROM funds f
        INNER JOIN fund_hash fh ON fh.hash = MD5(CONCAT(f.item, %%s))
        INNER JOIN fund_cache fc ON fh.fid = fc.fid
        INNER JOIN fund_cache_time c ON c.cid = fc.cid AND c.done = 1 AND %s
        WHERE f.uid = %d
        GROUP BY c.cid
        ) results""" % (min_time_cond, self.uid), [FUND_SALT])
        if num_results_query is False:
            return False

        num_results = -1
        for row in num_results_query:
            num_results = int(row[0])

        if num_results < 0:
            return False

        # get the association between fids and fund names
        fund_name_query = self.dbx.query("""
        SELECT DISTINCT fh.fid, item, transactions FROM funds f
        INNER JOIN fund_hash fh ON fh.hash = MD5(CONCAT(f.item, %%s))
        WHERE uid = %d
        """ % (self.uid), [FUND_SALT])
        if fund_name_query is False:
            return False

        # get the actual price results from the scraper cache
        query = self.dbx.query("""
        SELECT * FROM (
          SELECT fid, time, price, cNum, FLOOR(cNum %% (%d / %d)) AS period FROM (
            SELECT x.fid, x.time, x.price,
            (
              CASE x.cid
                WHEN @lastCid THEN @cNum
                ELSE @cNum := @cNum + 1 END
            ) AS cNum,
            @lastCid := x.cid AS last_cid
            FROM (
              SELECT c.cid, c.time,
              GROUP_CONCAT(fc.fid ORDER BY fc.fid) AS fid,
              GROUP_CONCAT(fc.price ORDER BY fc.fid) AS price
              FROM (SELECT DISTINCT item FROM funds WHERE uid = %d) f
              INNER JOIN fund_hash fh ON fh.hash = MD5(CONCAT(f.item, %%s))
              INNER JOIN fund_cache fc ON fh.fid = fc.fid
              INNER JOIN fund_cache_time c ON c.done = 1 AND %s AND c.cid = fc.cid
              GROUP BY c.cid
              ORDER BY time
            ) x
            JOIN (SELECT @cNum := -1, @lastCid := 0) r
          ) ranked
        ) list
        WHERE period = 0 OR cNum = %d""" % (\
                num_results, self.num_results_display, \
                self.uid, min_time_cond, num_results - 1), \
                [FUND_SALT])
        if query is False:
            return False

        funds, results, start_time, total_time = fund_history(fund_name_query, query)

        self.data['funds'] = funds
        self.data['history'] = results
        self.data['startTime'] = start_time
        self.data['totalTime'] = total_time

        return True

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
            'in': [['item', 'cost', 'Total']],
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
            'in':       ['item', 'cost'],
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

