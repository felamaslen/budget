""" Overview page data processor """

from math import ceil
from datetime import datetime
import json

from app.config import OVERVIEW_NUM_LAST, OVERVIEW_NUM_FUTURE, \
        START_YEAR, START_MONTH, LIST_CATEGORIES, FUND_SALT
from app.api_data_methods import Processor

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

def get_fund_value(year_month, transactions, prices):
    """ gets the total value at a certain date of a fund """
    # find the units for this month
    units = reduce(lambda last, item: \
            last + (item['u'] if \
            (year_month[0] > item['d'][0] or \
            (year_month[0] == item['d'][0] and year_month[1] >= item['d'][1])) \
            else 0), transactions, 0)

    # find the price for this month
    prices_current = [price for price in prices \
            if year_month[0] > price[0] or \
            (year_month[0] == price[0] and year_month[1] >= price[1])]

    if len(prices_current) == 0:
        # there is no accurate price cached, so revert to the cost of the fund
        # (neglecting growth)
        return reduce(lambda last, item: \
            last + (item['c'] if \
            (year_month[0] > item['d'][0] or \
            (year_month[0] == item['d'][0] and year_month[1] >= item['d'][1])) \
            else 0), transactions, 0)

    return prices_current[0][2] * units

def get_fund_prices(query):
    """ gets the prices of each fund for each month """
    prices = {}
    for (_time, _ids, _prices) in query:
        id_price = zip([int(x) for x in _ids.split(',')], \
                [float(x) for x in _prices.split(',')])

        year, month = [int(x) for x in datetime.fromtimestamp(_time) \
                .strftime('%Y-%m').split('-')]

        for _id, _price in id_price:
            if _id not in prices:
                prices[_id] = []
            prices[_id].append((year, month, _price))

    return prices

class Overview(Processor):
    """ get overview data """
    def __init__(self, db, uid):
        super(Overview, self).__init__(db, uid)

        self.year_months = get_year_months(OVERVIEW_NUM_LAST, \
                OVERVIEW_NUM_FUTURE)
        self.year_months_old = []

    def process(self):
        """ Get data and put it in the instance """
        categories = LIST_CATEGORIES
        balance, old, old_range = self.get_balance()
        self.year_months_old = [(year, month) \
                for year in range(old_range[0], old_range[2] + 1) \
                for month in range(1, 13) \
                if (year > old_range[0] or \
                (year == old_range[0] and month >= old_range[1])) and \
                (year < old_range[2] or \
                (year == old_range[2] and month <= old_range[3]))]

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

    def get_category_data_funds(self):
        """ get value of funds for each month """
        query = {}
        query['transactions'] = self.dbx.query("""
        SELECT id, transactions FROM `funds` WHERE uid = %d
        """ % (self.uid))

        query['prices'] = self.dbx.query("""
        SELECT ft.time, GROUP_CONCAT(f.id) AS id,
        GROUP_CONCAT(fc.price) AS price
        FROM fund_cache fc
        INNER JOIN fund_hash fh ON fh.fid = fc.fid
        INNER JOIN fund_cache_time ft ON ft.cid = fc.cid AND ft.done = 1
        INNER JOIN funds f ON MD5(CONCAT(f.item, %%s)) = fh.hash
        AND f.uid = %d
        GROUP BY ft.cid
        ORDER BY ft.time DESC
        """ % (self.uid), [FUND_SALT])

        if query['transactions'] is False or query['prices'] is False:
            raise EnvironmentError("database error")

        funds = {'transactions': []}

        funds['prices'] = get_fund_prices(query['prices'])

        for (_id, transactions) in query['transactions']:
            try:
                this_transactions = json.loads(transactions)
                funds['transactions'].append((_id, this_transactions))
            except ValueError:
                pass # bad json; ignore

        return [round(reduce(lambda last, this, ym=year_month: \
                    last + get_fund_value(ym, this[1], \
                    funds['prices'][this[0]]), funds['transactions'], 0)) \
                    for year_month in self.year_months_old + self.year_months]

    def get_category_data(self, category):
        """ get costs for each month in each category """
        if category == "funds":
            return self.get_category_data_funds()

        query = {}
        union = "SELECT %d AS y, %d AS m UNION " % self.year_months[0] + \
                " UNION ".join(["SELECT %d, %d" % self.year_months[i] \
                for i in range(1, len(self.year_months))])

        query['list'] = self.dbx.query("""
        SELECT SUM(cost) AS month_cost FROM (%s) AS dates
        LEFT JOIN `%s` AS list
        ON uid = %d AND ((list.year = dates.y AND list.month = dates.m))
        GROUP BY y, m
        """ % (union, category, self.uid), [])

        if query['list'] is False:
            raise EnvironmentError("database error")

        return [0 if row[0] is None else int(row[0]) for row in query['list']]

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
                old_range[3] = month if old_range[2] < year else max(old_range[3], month)
                old_range[2] = max(old_range[2], year)

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

        return balance, old, old_range

