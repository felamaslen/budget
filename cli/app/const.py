import curses

from app.modify import SERVER

""" The api is coded in python. The .php extension is purely historical """
API_URL = SERVER + "/rest.php"

LOGIN_FORM_TITLE = "Enter your PIN to log in: "
LOGIN_FORM_WIDTH = 42
LOGIN_FORM_HEIGHT = 7

""" ncurses colour pairs """
NC_COLOR_BG         = (1, curses.COLOR_WHITE, curses.COLOR_RED)
NC_COLOR_STATUS_BAR = NC_COLOR_BG
NC_COLOR_HEADER     = NC_COLOR_BG
NC_COLOR_TAB        = (2, curses.COLOR_WHITE, curses.COLOR_BLACK)
NC_COLOR_TAB_SEL    = (3, curses.COLOR_BLACK, curses.COLOR_WHITE)

NC_COLOR_UP         = (4, curses.COLOR_GREEN, curses.COLOR_BLACK)
NC_COLOR_UP_SEL     = (5, curses.COLOR_GREEN, curses.COLOR_WHITE)
NC_COLOR_DOWN       = (6, curses.COLOR_RED, curses.COLOR_BLACK)
NC_COLOR_DOWN_SEL   = (7, curses.COLOR_RED, curses.COLOR_WHITE)


""" keyboard shortcuts """
KEY_QUIT    = 'q'
KEY_LOGOUT  = 'L'

KEY_GRAPH   = 'g'

""" navigation sections """
NAV_SECT_TABS = 0
NAV_SECT_PAGE = 1

""" unicode characters for graphs """
CORNER_BOTTOM_LEFT  = u'\u2570'
CORNER_TOP_LEFT     = u'\u256d'
CORNER_TOP_RIGHT    = u'\u256e'
CORNER_BOTTOM_RIGHT = u'\u256f'

LINE_HORIZONTAL     = u'\u2500'
LINE_VERTICAL       = u'\u2502'
