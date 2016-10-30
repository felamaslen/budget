#!./env/bin/python

import sys
import re
import time
import mechanize

from db import database
from misc import strng, fund_hash, now

db = database()

E_CACHE = "Couldn't activate cache"
E_DATA  = "Data not correctly formatted"
E_DB    = "Database error"
E_URL   = "Couldn't get URL"
E_SCRAPE = "Couldn't scrape URL"

FUND_REGEX = '^(.*)\s\((accum|inc)\.?\)$'

class FundScraper(object):
    def __init__(self):
        self.verbose = '-v' in sys.argv
        self.quiet = '-q' in sys.argv

        self.fund_sell_price = { 'hl': {} }

        self.time_now = int(time.time())

        self.new_cache_cid = None

        if self.get_funds() is False:
            if not self.quiet:
                print "[FATAL]: %s" % E_DB
            return

        self.setup_browser()

        self.scrape()

    def setup_browser(self):
        """ this is required to avoid detection """
        self.br = mechanize.Browser()

        """ browser options """
        self.br.set_handle_equiv(True)
        #self.br.set_handle_gzip(True)
        self.br.set_handle_redirect(True)
        self.br.set_handle_referer(True)
        self.br.set_handle_robots(False)

        self.br.set_handle_refresh(mechanize._http.HTTPRefreshProcessor(), max_time = 1)

        """ user agent """
        self.br.addheaders = [('User-agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36')]

    def scrape(self):
        total = len(self.funds)

        key = 0

        for (_id, name, _hash, units) in self.funds:
            if not self.quiet:
                print "[%d/%d]: %s..." % (key + 1, total, name)

            price = self.scrape_fund(name, _hash, units)

            if self.verbose:
                print "Error, skipping" if price is None else "[price] %s" % price

            key += 1

        if self.new_cache_cid is not None:
            """ activate the last cache item, since we are done caching """
            done_query = db.query("""
            UPDATE fund_cache_time SET `done` = 1 WHERE `cid` = %s
            """, [self.new_cache_cid])

            if done_query is False and not self.quiet:
                print "[ERROR]: %s" % E_CACHE

    def scrape_fund(self, name, _hash, units):
        if not re.search(FUND_REGEX, name):
            return None

        """ TODO: process funds from other brokers (not just HL) """
        broker = 'hl'

        price = self.get_current_sell_price(broker, name, _hash)

        if price is not None:
            """ cache this item """
            self.add_cache_item(broker, _hash, price, units)

        elif not self.quiet:
            print "[ERROR]: %s" % E_SCRAPE

        """ don't scrape the same fund twice """
        if _hash not in self.fund_sell_price[broker]:
            self.fund_sell_price[broker][_hash] = price

        return price

    def add_cache_item(self, broker, _hash, price, units):
        try:
            self.insert_new_cid()
        except:
            return

        """ add this fund to the hash list if it's not there """
        hash_exists_query = db.query("""
        SELECT fid FROM fund_hash
        WHERE hash = %s AND broker = %s
        """, [_hash, broker])

        if hash_exists_query is False:
            if not self.quiet:
                print "[ERROR]: %s" % E_DB
            return

        hash_exists = False
        fid = None

        for row in hash_exists_query:
            hash_exists = True
            fid = int(row[0])

        if not hash_exists:
            hash_put_query = db.query("""
            INSERT INTO fund_hash (broker, hash) VALUES(%s, %s)
            """, [broker, _hash])

            if hash_put_query is False:
                if not self.quiet:
                    print "[ERROR]: %s" % E_DB
                return

            fid = db.last_insert_id()

        """ cache this value for display in the graph """
        cache_query = db.query("""
        INSERT INTO fund_cache (cid, fid, price, units) VALUES (%s, %s, %s, %s)
        """, [self.new_cache_cid, fid, price, units])

        if cache_query is False:
            if not self.quiet:
                print "[ERROR]: %s" % E_DB

    def insert_new_cid(self):
        if self.new_cache_cid is None:
            """ create a new cache item """
            query_new_item = db.query("""
            INSERT INTO fund_cache_time (`time`, `done`) VALUES (%s, 0)
            """, [self.time_now])

            if query_new_item is False:
                if not self.quiet:
                    print "[ERROR]: %s" % E_DB
                raise Exception

            self.new_cache_cid = db.last_insert_id()

    def get_current_sell_price(self, broker, name, _hash):
        if _hash in self.fund_sell_price[broker]:
            """ price already scraped (i.e. duplicate fund name) """
            return self.fund_sell_price[broker][_hash]

        """ price not scraped; now we must scrape """

        """ get the URL """
        url = self.get_fund_url(broker, name)

        if url is None:
            if not self.quiet:
                print "[WARN]: %s" % E_URL
            return None

        if self.verbose:
            print "[dl] %s" % url

        data = self.download_url(url)

        price = self.process_data(data, broker, name, _hash)

        return price

    def process_data(self, data, broker, name, _hash):
        if broker == 'hl':
            return self.process_data_hl(data, name, _hash)

        return None

    def process_data_hl(self, data, name, _hash):
        if data is None or len(data) == 0:
            return None

        """ build a regex to match the specific part of the html containing the bid (sell) price """
        match_parts = [
                ('<div id="security-price">',                               True),
                ('.*',                                                      False),
                ('<div>',                                                   True),
                ('\s*',                                                     False),
                ('<span class="price-label">Sell:</span><span class="bid',  True),
                ('[^>]+>',                                                  False),
                ('([0-9]+(\.[0-9]*)?)p\s*',                                 False),
                ('</span>',                                                 True)
            ]

        regex = ''.join([re.escape(item) if not_regex else item
            for (item, not_regex) in match_parts])

        data_proc = data.replace("\n", '').replace("\r", '').replace(',', '')

        matches = re.findall(regex, data_proc)

        try:
            price = float(matches[0][0])
            return price
        except:
            if self.verbose:
                print "[ERROR] %s" % E_DATA

            return None

    def download_url(self, url):
        response = self.br.open(url)

        return response.read()

    def get_fund_url(self, broker, name):
        if broker == 'hl':
            return self.get_fund_url_hl(name)

        return None

    def get_fund_url_hl(self, name):
        """ returns a URL like http://www.hl.co.uk/funds/fund-discounts,-prices--and--factsheets/search-results/h/hl-multi-manager-uk-growth-accumulation """

        matches = re.findall(FUND_REGEX, name)

        human_name = matches[0][0]
        human_type = matches[0][1]

        system_name = human_name.lower().replace(' ', '-')
        system_type = 'income' if human_type.lower() == 'inc' else 'accumulation'

        first_letter = system_name[:1]

        base_url = "http://www.hl.co.uk/funds/fund-discounts,-prices--and--factsheets/search-results"

        return "%s/%s/%s-%s" % (base_url, first_letter, system_name, system_type)

    def get_funds(self):
        query = db.query("""
        SELECT id, item, SUM(units) AS units
        FROM funds
        GROUP BY item
        """, [])

        if query is False:
            return False

        self.funds = [(
            int(_id), strng(name), fund_hash(name), float(units)
        ) for (_id, name, units) in query]

        return True

scraper = FundScraper()

db.close()
