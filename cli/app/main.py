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

        self.user = User(stdscr, api, self.draw_gui)

        self.loop()

    def init_ncurses_colors(self):
        curses.init_pair(*NC_COLOR_STATUS_BAR)

    def loop(self):
        """ main application loop """

        if self.user.uid > 0:
            self.draw_gui()
        else:
            self.user.logged_out()

        """ catch keyboard input """
        while True:
            c = self.scr.getch()

            if c == ord(KEY_QUIT):
                break # quit the app

            elif c == ord(KEY_LOGOUT):
                self.logout()

    def logout(self):
        self.user.logged_out()

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

        status_bar_text = "Logged in as {} ({}: quit, {}: logout)".format(\
                self.user.name, KEY_QUIT, KEY_LOGOUT)

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


