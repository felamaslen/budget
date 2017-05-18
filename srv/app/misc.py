"""
Miscellaneous functions
"""

import os.path
import time
from hashlib import md5
import re
import json

from app.config import SERIAL_FILE, FUND_SALT, LIST_DATA_FORM_SCHEMA

def file_get_contents(filename):
    """ opens a file and gets its contents """
    if not os.path.isfile(filename):
        return None

    with open(filename) as handler:
        return handler.read()

def file_put_contents(filename, text):
    """ writes to a file """
    try:
        target = open(filename, 'w')

        target.truncate()
        target.write(text)

        return 0
    except IOError:
        return 1

def new_serial(old_serial=None):
    """ generates a new serial for caching purposes (web app) """
    date = time.strftime("%Y%m%d")

    if old_serial is None or old_serial[:8] is not date:
        serial_index = 0
    else:
        serial_index = int(old_serial[8:]) + 1

    return date + str(serial_index)

def get_serial():
    """ gets the current serial for caching purposes (web app) """
    serial = file_get_contents(SERIAL_FILE)

    return new_serial() if serial is None else serial

def set_serial():
    """ updates the serial to clear web app cache """
    serial = file_get_contents(SERIAL_FILE)

    next_serial = new_serial(serial)

    print "new serial: %s" % next_serial

    file_put_contents(SERIAL_FILE, next_serial)

def fund_hash(fund):
    """ gets the fund name md5 hash """
    return md5(fund + FUND_SALT).hexdigest()

def strng(the_string):
    """ encodes a string with utf-8 """
    return u''.join(the_string).encode('utf-8')

def list_data_schema(table, do_id=True):
    """ builds form schema for list pages """
    schema = {}
    for (key, value) in LIST_DATA_FORM_SCHEMA[table].items():
        schema[key] = value

    if do_id:
        schema['id'] = ('int', False)

    schema['date'] = ('date', True)
    schema['item'] = ('string', True)
    schema['cost'] = ('int', True)

    return schema

def deserialise_date(string):
    """ validates and returns a date from a POST request """
    date_is_valid = re.search('^[0-9]{4},[0-9]{1,2},[0-9]{1,2}$', string)
    if not date_is_valid:
        raise ValueError("Date is not a valid date")

    year, month, date = string.split(',')

    year = int(year)
    month = int(month)
    date = int(date)

    if month < 1 or month > 12:
        raise ValueError("Date's month is out of range")

    month_length = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    year_is_leap = year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)

    if year_is_leap:
        month_length[1] = 29

    if date < 1 or date > month_length[month - 1]:
        raise ValueError("Date's day is out of range")

    return (year, month, date)

def deserialise_transactions(string):
    """ validates and returns a dated list of fund transactions """
    transactions = []
    if string is None or len(string) == 0:
        return transactions

    try:
        raw = json.loads(string)
    except ValueError:
        raise ValueError("Invalid JSON string for transactions")

    if not isinstance(raw, list):
        raise ValueError("Transactions not a list")

    for item in raw:
        if 'd' not in item or 'u' not in item or 'c' not in item:
            raise ValueError("Transactions list has incomplete data")

        date = deserialise_date(item['d'])
        units = float(item['u'])
        cost = int(item['c'])

        transactions.append({'d': date, 'u': units, 'c': cost})

    return transactions

def get_table_total(table, dbx, uid):
    """ gets the total cost of all items in a list """
    if table == 'overview':
        return -1

    query = dbx.query("""
    SELECT SUM(cost) AS total FROM `%s` WHERE uid = %d
    """ % (table, uid), [])

    if query is False:
        raise EnvironmentError

    total = -1
    for row in query:
        total = int(row[0])

    return total
