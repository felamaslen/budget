""" Global configuration variables """

import os.path

PIE_TOLERANCE = 0.075
PIE_DETAIL = 30
GRAPH_FUND_HISTORY_DETAIL = 200

OVERVIEW_NUM_LAST = 25
OVERVIEW_NUM_FUTURE = 10

START_YEAR = 2014
START_MONTH = 9

LIST_CATEGORIES = \
        ('funds', 'in', 'bills', 'food', 'general', 'holiday', 'social')

# common columns are added programmatically
# the second parameter is a boolean marking if column is optional
LIST_DATA_FORM_SCHEMA = {
    'funds':    {
        'transactions': ('transactions', True)
    },
    'in': {
    },
    'bills': {
    },
    'food': {
        'category': ('string', True),
        'shop': ('string', True)
    },
    'general': {
        'category': ('string', True),
        'shop': ('string', True)
    },
    'holiday': {
        'holiday': ('string', True),
        'shop': ('string', True)
    },
    'social': {
        'society': ('string', True),
        'shop': ('string', True)
    }
}

IP_BAN_TIME = 60
IP_BAN_TRIES = 10
# base directory of the project (i.e. 1 up from srv)
BASE_DIR = os.path.dirname(os.path.realpath(__file__)) + "/../.."
SERIAL_FILE = BASE_DIR + "/resources/serial"

FUND_SALT = 'a963anx2'

# error messages
E_NO_PARAMS = "Not enough parameters given"
E_BAD_PARAMS = "Invalid parameters given"
E_NO_FORM = "Not enough form data given"
E_BAD_FORM = "Invalid form data given"
E_NO_ITEM = "Must supply an item (at least)"

