import curses

from app.api import BudgetClientAPI
from app.user import User

from const import *

class BudgetClient(object):
    def __init__(self):
        pass

    def start(self, stdscr):
        """ this is called by the ncurses wrapper """
        self.scr = stdscr

        self.init_ncurses_colors()

        self.api = api = BudgetClientAPI()

        self.user = User(stdscr, api)

        self.logged_in_loop()

    def init_ncurses_colors(self):
        curses.init_pair(*NC_COLOR_STATUS_BAR)

    def logged_in_loop(self):
        """ main application loop """
        self.draw_gui()

        while True:
            c = self.scr.getch()

            if c == ord('q'):
                break # quit the app

    def draw_gui(self):
        """ calls other methods to draw the main application window """
        self.scr.clear()
        self.scr.refresh()

        self.gui_statusbar()

    def gui_statusbar(self):
        """ draws a status bar at the bottom of the screen """
        x = 0
        y = curses.LINES - 1
        w = curses.COLS
        h = 1

        status_bar_text = "Logged in as {}".format(self.user.name)

        if len(status_bar_text) > w:
            """ limit length of status bar """
            status_bar_text = status_bar_text[:3] + "..."

        elif len(status_bar_text) < w:
            """ add spaces to fill width """
            num_spaces = w - len(status_bar_text) - 1

            status_bar_text = status_bar_text + (' ' * num_spaces)

        color = curses.color_pair(NC_COLOR_STATUS_BAR[0])

        statusbar = curses.newwin(h, w, y, x)
        statusbar.clear()

        statusbar.addstr(0, 0, status_bar_text, color)

        statusbar.refresh()


