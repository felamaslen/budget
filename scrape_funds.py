#!./env/bin/python

"""
Scrapes fund values (prices, top holdings) from the internet
"""

import sys
import re
import time
import csv
import mechanize

from srv.db import Database
from srv.misc import strng, fund_hash
from srv.config import BASE_DIR

DB = Database()

E_CACHE = "Couldn't activate cache"
E_DATA = "Data not correctly formatted"
E_DB = "Database error"
E_URL = "Couldn't get URL"
E_SCRAPE = "Couldn't scrape URL"

FUND_REGEX = r'^(.*)\s\((accum|inc|share)\.?\)$'

TICKERS = BASE_DIR + '/resources/tickers.csv'

def match_parts_regex(parts, data):
    """ builds a regex out of parts, and matches strng with it """
    regex = ''.join([re.escape(item) if not_regex else item \
        for (item, not_regex) in parts])

    return re.findall(regex, data)

def get_fund_broker(name):
    """ get the broker of a fund (only does HL for the moment) """
    if not re.search(FUND_REGEX, name):
        return None

    # TODO: process funds from other brokers (not just HL)
    broker = 'hl'

    return broker

def process_data_holdings(data, broker, name):
    """ gets the top holdings from raw html """
    if data is None or len(data) == 0:
        return None

    if broker == 'hl':
        return process_data_holdings_hl(data, hl_fund_is_share(name))

    return None

def process_data_holdings_hl(data, is_share):
    """ gets the top holdings from raw html data (HL) """
    raw = re.sub(r'\t+', '', data.replace("\n", '').replace("\r", ''))

    parts = [
        ('<table class="factsheet-table" summary="Top 10 holdings">', True),
        (r'(.*?)', False),
        ('</table>', True)
    ]
    if is_share:
        parts[0] = (\
                '<table class="factsheet-table" summary="Top 10 exposures">',
                True)

    match_table = match_parts_regex(parts, raw)

    if len(match_table) == 0:
        return None

    match_rows = re.findall(r'\<tr[^\>]*\>(.*?)\<\/tr\>', match_table[0])

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

def hl_fund_is_share(name):
    """ returns True if a fund is a share (as opposed to mutual fund etc.) """
    return True if re.match(r'^(.*)\(share\.?\)$', name) else False

def get_fund_url_hl(name):
    """
    returns a URL like:
    http://www.hl.co.uk/funds/fund-discounts,-prices--and--factsheets/search-results/h/hl-multi-manager-uk-growth-accumulation
    """
    matches = re.findall(FUND_REGEX, name)

    human_name = matches[0][0]
    human_type = matches[0][1].lower()

    system_name = human_name.lower().replace(' ', '-')

    if human_type == 'inc':
        system_type = 'income'
    elif human_type == 'accum':
        system_type = 'accumulation'
    elif human_type == 'share':
        system_type = 'share'

    first_letter = system_name[:1]
    base_url = "http://www.hl.co.uk/"

    if system_type == 'share':
        base_url = base_url + "shares/shares-search-results"
        return "%s/%s/%s" % (base_url, first_letter, system_name)

    base_url = base_url + \
            "funds/fund-discounts,-prices--and--factsheets/search-results"
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
                try:
                    tickers[row[0]] = ''
                except IndexError:
                    # invalid csv file row
                    pass

    return tickers

def save_tickers(tickers):
    """ write ticker values to resource file """
    with open(TICKERS, 'wb') as csvfile:
        writer = csv.writer(csvfile, delimiter=',', quotechar='"', \
                quoting=csv.QUOTE_MINIMAL)

        for name in tickers:
            writer.writerow([name, tickers[name]])

TIME_NOW = int(time.time())

class FundScraper(object):
    """ contains methods to scrape fund values """
    def __init__(self):
        self.switch = {
            'verbose': '-v' in sys.argv,
            'quiet': '-q' in sys.argv,
            'holdings': 'holdings' in sys.argv
        }

        self.fund_data_cache = {'hl': {}}
        self.fund_holdings_rows = []

        self.cache = {'queue': [], 'cid': None}

        self.ticker = {
            'added': None,
            'list': []
        }

        if self.get_funds() is False:
            if not self.switch['quiet']:
                print "[FATAL]: %s" % E_DB
            return

        self.setup_browser()

        self.scrape(self.switch['holdings'])

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
        user_agent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 ' + \
                '(KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36'

        self.browser.addheaders = [('User-agent', user_agent)]

    def scrape(self, holdings):
        """ do the scraping """
        # get saved security tickers
        self.ticker['list'] = get_tickers()
        self.ticker['added'] = False

        # get the data
        self.scrape_funds(holdings)

        # process the data
        self.process_scrape(holdings)

    def scrape_funds(self, holdings):
        """ scrape actual data from the web """
        total = len(self.funds)
        key = 0
        for (name, uid, _hash, units, cost) in self.funds:
            if not self.switch['quiet']:
                print "[%d/%d]: %s..." % (key + 1, total, name)

            if holdings:
                # get fund top holdings
                self.scrape_holdings(name, uid, _hash, cost)

            else:
                # get fund prices
                price = self.scrape_price(name, _hash, units)

                if self.switch['verbose']:
                    print "Error, skipping" if price is None else \
                            "[price] %s" % price

            key += 1

    def process_scrape(self, holdings):
        """ process and cache scraped and preprocessed data """
        if holdings:
            if self.ticker['added']:
                save_tickers(self.ticker['list'])

            self.save_holdings()

        else:
            # add the results to the database
            if self.switch['verbose']:
                new_total = sum([price * units for (_, _, price, units) \
                        in self.cache['queue']]) / 100
                print "Current value: %f" % new_total

                save_results = raw_input("Cache these results? [Y/n] ")

                if len(save_results) > 0 and save_results != 'y' \
                        and save_results != 'Y':
                    print "[WARN]: Results not saved to database"

                    return

            for (broker, _hash, price, units) in self.cache['queue']:
                self.add_cache_item(broker, _hash, price, units)

            if self.cache['cid'] is not None:
                # activate the last cache item, since we are done caching
                done_query = DB.query("""
                UPDATE fund_cache_time SET `done` = 1 WHERE `cid` = %s
                """, [self.cache['cid']])

                if done_query is False and not self.switch['quiet']:
                    print "[ERROR]: %s" % E_CACHE

    def save_holdings(self):
        """ saves the scraped stock holdings to the database """
        rows = self.fund_holdings_rows

        if self.switch['verbose']:
            print "Saving new holding values..."

        delete_query = DB.query("""
        TRUNCATE stocks
        """)

        if delete_query is False:
            if not self.switch['quiet']:
                print "[ERROR]: %s" % E_DB
            return

        for (uid, security, code, cost, perc) in rows:
            insert_query = DB.query("""
            INSERT INTO stocks (uid, name, code, weight, subweight)
            VALUES (%s, %s, %s, %s, %s)
            """, [uid, security, code, cost, perc])

            if insert_query is False:
                if not self.switch['quiet']:
                    print "[ERROR]: %s" % E_DB
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
                do_item = True

                if security in self.ticker['list']:
                    code = self.ticker['list'][security]
                elif self.switch['quiet']:
                    do_item = False
                else:
                    code = raw_input("Enter ticker for '%s': " % security)

                    self.ticker['added'] = True
                    self.ticker['list'][security] = code

                if do_item and len(code) > 0:
                    rows.append([uid, security, code, cost, perc])

            self.fund_holdings_rows += rows

        elif self.switch['verbose']:
            print "[WARN]: Couldn't get holdings for %s" % name

    def scrape_price(self, name, _hash, units):
        """ scrapes a fund's price """
        broker = get_fund_broker(name)
        if broker is None:
            return None

        price = self.get_current_sell_price(broker, name, _hash)

        if price is not None:
            # cache this item
            self.queue_add_cache_item(broker, _hash, price, units)

        elif not self.switch['quiet']:
            print "[ERROR]: %s" % E_SCRAPE

        return price

    def get_fund_data(self, broker, name, _hash):
        """ gets raw html data for scraping """
        if _hash in self.fund_data_cache[broker]:
            # don't make duplicate requests
            return self.fund_data_cache[broker][_hash]

        url = self.get_fund_url(broker, name)
        data = None if url is None else self.download_url(url)

        self.fund_data_cache[broker][_hash] = data

        return data

    def queue_add_cache_item(self, broker, _hash, price, units):
        """ queues an item to be added to the cache """
        self.cache['queue'].append([broker, _hash, price, units])

    def add_cache_item(self, broker, _hash, price, units):
        """ inserts new item into the latest fund cache """
        try:
            self.insert_new_cid()

            # add this fund to the hash list if it's not there
            hash_exists_query = DB.query("""
            SELECT fid FROM fund_hash
            WHERE hash = %s AND broker = %s
            """, [_hash, broker])

            if hash_exists_query is False:
                if not self.switch['quiet']:
                    print "[ERROR]: %s" % E_DB
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
                    if not self.switch['quiet']:
                        print "[ERROR]: %s" % E_DB
                    return

                fid = DB.last_insert_id()

            # cache this value for display in the graph
            cache_query = DB.query("""
            INSERT INTO fund_cache (cid, fid, price, units) VALUES (%s, %s, %s, %s)
            """, [self.cache['cid'], fid, price, units])

            if cache_query is False:
                if not self.switch['quiet']:
                    print "[ERROR]: %s" % E_DB

        except EnvironmentError:
            # database error
            return

    def insert_new_cid(self):
        """ inserts new item into the fund cache list """
        if self.cache['cid'] is None:
            # create a new cache item
            query_new_item = DB.query("""
            INSERT INTO fund_cache_time (`time`, `done`) VALUES (%s, 0)
            """, [TIME_NOW])

            if query_new_item is False:
                if not self.switch['quiet']:
                    print "[ERROR]: %s" % E_DB
                raise EnvironmentError

            self.cache['cid'] = DB.last_insert_id()

    def get_top_holdings(self, broker, name, _hash):
        """ gets the top stock holdings on a fund """
        data = self.get_fund_data(broker, name, _hash)

        holdings = process_data_holdings(data, broker, name)

        return holdings

    def get_current_sell_price(self, broker, name, _hash):
        """ gets the current sell price for a fund """
        data = self.get_fund_data(broker, name, _hash)

        price = self.process_data_price(data, broker)

        return price

    def process_data_price(self, data, broker):
        """ gets the fund price from raw html """
        if data is None or len(data) == 0:
            return None

        if broker == 'hl':
            return self.process_data_price_hl(data)

        return None

    def process_data_price_hl(self, data):
        """ gets the fund price from raw html (HL) """

        # build a regex to match the specific part of the html
        # containing the bid (sell) price
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

        data_proc = data.replace("\n", '').replace("\r", '').replace(',', '')

        matches = match_parts_regex(match_parts, data_proc)

        try:
            price = float(matches[0][0])
            return price
        except ValueError:
            if self.switch['verbose']:
                print "[ERROR] %s" % E_DATA

            return None

    def download_url(self, url):
        """ downloads data using a spoofed browser """
        response = self.browser.open(url)

        return response.read()

    def get_fund_url(self, broker, name):
        """ gets the url of a fund to scrape """
        url = None

        if broker == 'hl':
            url = get_fund_url_hl(name)

        if url is None:
            if not self.switch['quiet']:
                print "[WARN]: %s" % E_URL
            return None

        if self.switch['verbose']:
            print "[dl] %s" % url

        return url

    def get_funds(self):
        """ get list of funds in database """
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

SCRAPER = FundScraper()

DB.close()
