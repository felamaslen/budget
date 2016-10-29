"""
Miscellaneous functions
"""

import os.path
import time
from datetime import datetime
from hashlib import md5
import re

from config import SERIAL_FILE, FUND_SALT, LIST_DATA_FORM_SCHEMA

now = datetime.now()

def file_get_contents(filename):
    if not os.path.isfile(filename):
        return None

    with open(filename) as f:
        return f.read()

def file_put_contents(filename, text):
    try:
        target = open(filename, 'w')

        target.truncate()
        target.write(text)

        return 0
    except IOError:
        return 1

def new_serial(oldSerial = None):
    date = time.strftime("%Y%m%d")

    if oldSerial is None or oldSerial[:8] is not date:
        serialIndex = 0
    else:
        serialIndex = int(oldSerial[8:]) + 1

    return date + str(serialIndex)

def get_serial():
    serial = file_get_contents(SERIAL_FILE)

    return new_serial() if serial is None else serial

def set_serial():
    serial = file_get_contents(SERIAL_FILE)

    next_serial = new_serial(serial)

    print "new serial: %s" % next_serial

    file_put_contents(SERIAL_FILE, next_serial)

def fund_hash(fund):
    return md5(fund + FUND_SALT).hexdigest()

def strng(the_string):
    return u''.join(the_string).encode('utf-8')

def list_data_schema(table, do_id = True):
    schema = LIST_DATA_FORM_SCHEMA[table]

    if do_id:
        schema['id'] = ('int', False)

    schema['date'] = ('date',      True)
    schema['item'] = ('string',    True)
    schema['cost'] = ('int',       True)

    return schema

def deserialise_date(string):
    """ validates and returns a date from a POST request """
    date_is_valid = re.search('^[0-9]{4},[0-9]{1,2},[0-9]{1,2}$', string)

    if not date_is_valid:
        raise ValueError("Date is not a valid date")

    year, month, date = string.split(',')

    year    = int(year)
    month   = int(month)
    date    = int(date)

    if month < 1 or month > 12:
        raise ValueError("Date's month is out of range")

    month_length = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    year_is_leap = year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)

    if year_is_leap:
        month_length[1] = 29

    if date < 1 or date > month_length[month - 1]:
        raise ValueError("Date's day is out of range")

    return (year, month, date)

def get_table_total(table, db, uid):
    if table == 'overview':
        return -1

    query = db.query("""
    SELECT SUM(cost) AS total FROM `%s` WHERE uid = %d
    """ % (table, uid), [])

    if query is False:
        raise Exception

    total = -1
    for row in query:
        total = int(row[0])

    return total

