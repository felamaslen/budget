import curses

from modify import SERVER

""" The api is coded in python. The .php extension is purely historical """
API_URL = SERVER + "/rest.php"

LOGIN_FORM_TITLE = "Enter your PIN to log in: "
LOGIN_FORM_WIDTH = 42
LOGIN_FORM_HEIGHT = 7

""" ncurses colour pairs """
NC_COLOR_STATUS_BAR = (1, curses.COLOR_WHITE, curses.COLOR_BLUE)

""" keyboard shortcuts """
KEY_QUIT    = 'q'
KEY_LOGOUT  = 'l'
