#!./env/bin/python

"""
Scrapes fund values (prices, top holdings) from the internet
"""

import sys
import re
import time
import mechanize
import csv

from db import database
from misc import strng, fund_hash
from config import BASE_DIR

DB = database()

E_CACHE = "Couldn't activate cache"
E_DATA = "Data not correctly formatted"
E_DB = "Database error"
E_URL = "Couldn't get URL"
E_SCRAPE = "Couldn't scrape URL"

FUND_REGEX = r'^(.*)\s\((accum|inc)\.?\)$'

TICKERS = BASE_DIR + '/resources/tickers.csv'

def get_fund_broker(name):
    if not re.search(FUND_REGEX, name):
        return None

    # TODO: process funds from other brokers (not just HL)
    broker = 'hl'

    return broker

def get_fund_url_hl(name):
    """
    returns a URL like:
    http://www.hl.co.uk/funds/fund-discounts,-prices--and--factsheets/search-results/h/hl-multi-manager-uk-growth-accumulation
    """

    matches = re.findall(FUND_REGEX, name)

    human_name = matches[0][0]
    human_type = matches[0][1]

    system_name = human_name.lower().replace(' ', '-')
    system_type = 'income' if human_type.lower() == 'inc' else 'accumulation'

    first_letter = system_name[:1]

    base_url = "http://www.hl.co.uk/funds/fund-discounts,-prices--and--factsheets/search-results"

    return "%s/%s/%s-%s" % (base_url, first_letter, system_name, system_type)

def get_tickers():
    """ get ticker values from resource file """
    tickers = {}
    with open(TICKERS, 'rb') as csvfile:
        reader = csv.reader(csvfile, delimiter=',', quotechar='"')

        for row in reader:
            try:
                tickers[row[0]] = row[1]
            except IndexError:
                # invalid csv file row
                pass

    return tickers

def save_tickers(tickers):
    """ write ticker values to resource file """
    with open(TICKERS, 'wb') as csvfile:
        writer = csv.writer(csvfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)

        for name in tickers:
            writer.writerow([name, tickers[name]])

class FundScraper(object):
    """ contains methods to scrape fund values """
    def __init__(self):
        get_holdings = 'holdings' in sys.argv

        self.verbose = '-v' in sys.argv
        self.quiet = '-q' in sys.argv

        self.fund_sell_price = {'hl': {}}
        self.fund_holdings = {'hl': {}}

        self.fund_holdings_rows = []

        self.time_now = int(time.time())

        self.new_cache_cid = None

        if self.get_funds() is False:
            if not self.quiet:
                print("[FATAL]: %s" % E_DB)
            return

        self.setup_browser()

        self.scrape(get_holdings)

    def setup_browser(self):
        """ spoof a browser to avoid detection """
        self.browser = mechanize.Browser()

        # browser options
        self.browser.set_handle_equiv(True)
        #self.browser.set_handle_gzip(True)
        self.browser.set_handle_redirect(True)
        self.browser.set_handle_referer(True)
        self.browser.set_handle_robots(False)

        self.browser.set_handle_refresh(mechanize._http.HTTPRefreshProcessor(),\
                max_time=1)

        # user agent
        user_agent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36'

        self.browser.addheaders = [('User-agent', user_agent)]

    def scrape(self, holdings):
        """ do the scraping """
        total = len(self.funds)

        # get saved security tickers
        self.tickers = get_tickers()
        self.ticker_added = False

        key = 0
        for (name, uid, _hash, units, cost) in self.funds:
            if not self.quiet:
                print("[%d/%d]: %s..." % (key + 1, total, name))

            if holdings:
                # get fund top holdings
                self.scrape_holdings(name, uid, _hash, cost)

            else:
                # get fund prices
                price = self.scrape_price(name, _hash, units)

                if self.verbose:
                    print("Error, skipping" if price is None else \
                            "[price] %s" % price)

            key += 1

        if holdings:
            if self.ticker_added:
                save_tickers(self.tickers)

            self.save_holdings()

        else:
            if self.new_cache_cid is not None:
                # activate the last cache item, since we are done caching
                done_query = DB.query("""
                UPDATE fund_cache_time SET `done` = 1 WHERE `cid` = %s
                """, [self.new_cache_cid])

                if done_query is False and not self.quiet:
                    print("[ERROR]: %s" % E_CACHE)

    def save_holdings(self):
        """ saves the scraped stock holdings to the database """

        rows = self.fund_holdings_rows

        if self.verbose:
            print("Saving new holding values...")

        delete_query = DB.query("""
        TRUNCATE stocks
        """)

        if delete_query is False:
            if not self.quiet:
                print("[ERROR]: %s" % E_DB)
            return

        for (uid, security, code, cost, perc) in rows:
            insert_query = DB.query("""
            INSERT INTO stocks (uid, name, code, weight, subweight)
            VALUES (%s, %s, %s, %s, %s)
            """, [uid, security, code, cost, perc])

            if insert_query is False:
                if not self.quiet:
                    print("[ERROR]: %s" % E_DB)
                return

    def scrape_holdings(self, name, uid, _hash, cost):
        """ gets current top 10 holdings in a fund """
        broker = get_fund_broker(name)
        if broker is None:
            return None

        holdings = self.get_top_holdings(broker, name, _hash)

        rows = []
        if holdings is not None:
            for (security, perc) in holdings:
                if security in self.tickers:
                    code = self.tickers[security]
                else:
                    code = raw_input("Enter ticker for '%s': " % security)

                    self.tickers[security] = code
                    self.ticker_added = True

                rows.append([uid, security, code, cost, perc])

            self.fund_holdings_rows += rows

        elif self.verbose:
            print("[WARN]: Couldn't get holdings for %s" % name)

        # don't scrape the same fund twice
        if _hash not in self.fund_holdings[broker]:
            self.fund_holdings[broker][_hash] = holdings

    def scrape_price(self, name, _hash, units):
        broker = get_fund_broker(name)
        if broker is None:
            return None

        price = self.get_current_sell_price(broker, name, _hash)

        if price is not None:
            # cache this item
            self.add_cache_item(broker, _hash, price, units)

        elif not self.quiet:
            print("[ERROR]: %s" % E_SCRAPE)

        # don't scrape the same fund twice
        if _hash not in self.fund_sell_price[broker]:
            self.fund_sell_price[broker][_hash] = price

        return price

    def get_fund_data(self, broker, name):
        """ gets raw html data for scraping """
        url = self.get_fund_url(broker, name)

        return None if url is None else self.download_url(url)

    def add_cache_item(self, broker, _hash, price, units):
        try:
            self.insert_new_cid()

            # add this fund to the hash list if it's not there
            hash_exists_query = DB.query("""
            SELECT fid FROM fund_hash
            WHERE hash = %s AND broker = %s
            """, [_hash, broker])

            if hash_exists_query is False:
                if not self.quiet:
                    print("[ERROR]: %s" % E_DB)
                return

            hash_exists = False
            fid = None

            for row in hash_exists_query:
                hash_exists = True
                fid = int(row[0])

            if not hash_exists:
                hash_put_query = DB.query("""
                INSERT INTO fund_hash (broker, hash) VALUES(%s, %s)
                """, [broker, _hash])

                if hash_put_query is False:
                    if not self.quiet:
                        print("[ERROR]: %s" % E_DB)
                    return

                fid = DB.last_insert_id()

            # cache this value for display in the graph
            cache_query = DB.query("""
            INSERT INTO fund_cache (cid, fid, price, units) VALUES (%s, %s, %s, %s)
            """, [self.new_cache_cid, fid, price, units])

            if cache_query is False:
                if not self.quiet:
                    print("[ERROR]: %s" % E_DB)

        except EnvironmentError:
            # database error
            return

    def insert_new_cid(self):
        if self.new_cache_cid is None:
            # create a new cache item
            query_new_item = DB.query("""
            INSERT INTO fund_cache_time (`time`, `done`) VALUES (%s, 0)
            """, [self.time_now])

            if query_new_item is False:
                if not self.quiet:
                    print("[ERROR]: %s" % E_DB)
                raise EnvironmentError

            self.new_cache_cid = DB.last_insert_id()

    def get_top_holdings(self, broker, name, _hash):
        """ gets the top stock holdings on a fund """
        if _hash in self.fund_holdings[broker]:
            # holdings already scraped (i.e. duplicate fund name)
            return self.fund_holdings[broker][_hash]

        data = self.get_fund_data(broker, name)
        if data is None:
            return None

        holdings = self.process_data_holdings(data, broker, name)

        return holdings

    def get_current_sell_price(self, broker, name, _hash):
        if _hash in self.fund_sell_price[broker]:
            # price already scraped (i.e. duplicate fund name)
            return self.fund_sell_price[broker][_hash]

        # price not scraped; now we must scrape
        data = self.get_fund_data(broker, name)
        if data is None:
            return None

        price = self.process_data_price(data, broker)

        return price

    def process_data_price(self, data, broker):
        if data is None or len(data) == 0:
            return None

        if broker == 'hl':
            return self.process_data_price_hl(data)

        return None

    def process_data_price_hl(self, data):
        # build a regex to match the specific part of the html containing the bid (sell) price
        match_parts = [
            ('<div id="security-price">', True),
            (r'.*', False),
            ('<div>', True),
            (r'\s*', False),
            ('<span class="price-label">Sell:</span><span class="bid', True),
            (r'[^>]+>', False),
            (r'([0-9]+(\.[0-9]*)?)p\s*', False),
            ('</span>', True)
        ]

        regex = ''.join([re.escape(item) if not_regex else item \
            for (item, not_regex) in match_parts])

        data_proc = data.replace("\n", '').replace("\r", '').replace(',', '')

        matches = re.findall(regex, data_proc)

        try:
            price = float(matches[0][0])
            return price
        except ValueError:
            if self.verbose:
                print("[ERROR] %s" % E_DATA)

            return None

    def process_data_holdings(self, data, broker, name):
        if data is None or len(data) == 0:
            return None

        if broker == 'hl':
            return self.process_data_holdings_hl(data, name)

        return None

    def process_data_holdings_hl(self, data, name):
        raw = re.sub(r'\t+', '', data.replace("\n", '').replace("\r", ''))

        parts = [
            ('<table class="factsheet-table" summary="Top 10 holdings">', True),
            (r'(.*?)', False),
            ('</table>', True)
        ]

        regex_table = ''.join([re.escape(item) if not_regex else item \
                for (item, not_regex) in parts])

        match_table = re.findall(regex_table, raw)

        if len(match_table) == 0:
            return None

        regex_rows = r'\<tr[^\>]*\>(.*?)\<\/tr\>'
        match_rows = re.findall(regex_rows, match_table[0])

        regex_cells = r'\<td[^\>]*\>(.*?)\<\/td\>'

        holdings = []

        for row in match_rows:
            match_cells = re.findall(regex_cells, row)

            if len(match_cells) == 2:
                name = re.sub(r'\<[^\>]*\>', '', match_cells[0])

                try:
                    value = float(re.sub(r'[^\d\.]', '', match_cells[1]))

                    holdings.append([name, value])
                except ValueError:
                    pass

        return holdings

    def download_url(self, url):
        """ downloads data using a spoofed browser """
        response = self.browser.open(url)

        return response.read()

    def get_fund_url(self, broker, name):
        url = None

        if broker == 'hl':
            url = get_fund_url_hl(name)

        if url is None:
            if not self.quiet:
                print("[WARN]: %s" % E_URL)
            return None

        if self.verbose:
            print("[dl] %s" % url)

        return url

    def get_funds(self):
        query = DB.query("""
        SELECT item, uid, SUM(units) AS units, SUM(cost) AS cost
        FROM funds
        WHERE units > 0 AND cost > 0
        GROUP BY uid, item
        """, [])

        if query is False:
            return False

        self.funds = [(
            strng(name), int(uid), fund_hash(name), float(units), int(cost)
        ) for (name, uid, units, cost) in query]

        return True

scraper = FundScraper()

DB.close()
