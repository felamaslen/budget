"""
Constant values
"""

import curses

from os import environ
from os.path import join, dirname
from dotenv import load_dotenv

dotenv_path = join(dirname(__file__), '../.env');
load_dotenv(dotenv_path)

SERVER = environ.get('WEB_URL')

API_URL = SERVER + "/api"

LOGIN_FORM_TITLE = "Enter your PIN to log in: "
LOGIN_FORM_WIDTH = 42
LOGIN_FORM_HEIGHT = 7

""" ncurses colour pairs """
NC_COLOR_BG = (1, curses.COLOR_WHITE, curses.COLOR_RED)
NC_COLOR_STATUS_BAR = NC_COLOR_BG
NC_COLOR_HEADER = NC_COLOR_BG
NC_COLOR_TAB = (2, curses.COLOR_WHITE, curses.COLOR_BLACK)
NC_COLOR_TAB_SEL = (3, curses.COLOR_BLACK, curses.COLOR_WHITE)

NC_COLOR_UP = (4, curses.COLOR_GREEN, curses.COLOR_BLACK)
NC_COLOR_UP_SEL = (5, curses.COLOR_GREEN, curses.COLOR_WHITE)
NC_COLOR_DOWN = (6, curses.COLOR_RED, curses.COLOR_BLACK)
NC_COLOR_DOWN_SEL = (7, curses.COLOR_RED, curses.COLOR_WHITE)

BTN_CANCEL_TEXT = "nope.avi"
BTN_SUBMIT_TEXT = "Do it."

""" keyboard shortcuts """
KEY_QUIT = 'q'
KEY_LOGOUT = 'L'
KEY_EDIT = 'e'

KEY_GRAPH = 'g'

""" ascii definitions """
KEYCODE_TAB = 9
KEYCODE_NEWLINE = 10
KEYCODE_RETURN = 13

""" navigation sections """
NAV_SECT_TABS = 0
NAV_SECT_PAGE = 1

SYMBOL_CURRENCY = u'\xA3'

""" unicode characters for graphs """
CORNER_BOTTOM_LEFT = u'\u2570'
CORNER_TOP_LEFT = u'\u256d'
CORNER_TOP_RIGHT = u'\u256e'
CORNER_BOTTOM_RIGHT = u'\u256f'

LINE_HORIZONTAL = u'\u2500'
LINE_VERTICAL = u'\u2502'
