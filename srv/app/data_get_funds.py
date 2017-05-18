""" Funds page data processor """

import json
import time

from app.misc import fund_hash, strng
from app.config import FUND_SALT, GRAPH_FUND_HISTORY_DETAIL
from app.api_data_methods import Processor
from app.data_get import ListData

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
    }

    results = {'funds': {'items': [], 'transactions': []}, 'rows': []}

    fid = {'keys': {}, 'num': 0}

    the_time = None
    for (fids, _time, prices, _, _) in query:
        fids = fids.split(',')
        prices = prices.split(',')

        the_time = int(_time)
        if times['start'] is None:
            times['start'] = the_time

        row = [] if fid['num'] == 0 else [0] * fid['num']
        for j, _fid in enumerate(fids):
            this_fid = int(_fid)

            item = strng(funds[this_fid][0])
            if item not in results['funds']['items']:
                results['funds']['items'].append(item)
                results['funds']['transactions'].append( \
                        json.loads(funds[this_fid][1]))

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

        funds, results, start_time, total_time = \
                fund_history(fund_name_query, query)

        self.data['funds'] = funds
        self.data['history'] = results
        self.data['startTime'] = start_time
        self.data['totalTime'] = total_time

        return True

